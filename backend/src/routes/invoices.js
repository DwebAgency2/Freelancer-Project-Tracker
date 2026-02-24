const express = require('express');
const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const InvoiceLineItem = require('../models/InvoiceLineItem');
const TimeEntry = require('../models/TimeEntry');
const Client = require('../models/Client');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ─── GET /api/invoices/next-number ────────────────────────────────────────────
router.get('/next-number', async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('invoice_prefix invoice_next_number');
        const nextNumber = `${user.invoice_prefix || 'INV'}-${String(user.invoice_next_number || 1).padStart(4, '0')}`;
        res.json({ next_number: nextNumber });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/invoices ────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
    try {
        const { status, client_id, start_date, end_date } = req.query;
        const userId = req.user._id;

        // Auto-mark overdue invoices
        await Invoice.updateMany(
            { user_id: userId, status: 'SENT', due_date: { $lt: new Date() } },
            { $set: { status: 'OVERDUE' } }
        );

        let query = { user_id: userId };
        if (status) query.status = status.toUpperCase();
        if (client_id) query.client_id = client_id;
        if (start_date || end_date) {
            query.invoice_date = {};
            if (start_date) query.invoice_date.$gte = new Date(start_date);
            if (end_date) query.invoice_date.$lte = new Date(end_date);
        }

        const invoices = await Invoice.find(query)
            .populate('client_id', 'name company')
            .sort({ invoice_date: -1, createdAt: -1 });

        // Format for frontend
        const formattedInvoices = invoices.map(i => ({
            ...i.toObject(),
            client_name: i.client_id?.name,
            client_company: i.client_id?.company
        }));

        res.json({ invoices: formattedInvoices });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/invoices/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
    try {
        const userId = req.user._id;
        const invoiceId = req.params.id;

        const invoiceDoc = await Invoice.findOne({ _id: invoiceId, user_id: userId })
            .populate('client_id', 'name company email address');

        if (!invoiceDoc) return res.status(404).json({ message: 'Invoice not found.' });

        const invoice = invoiceDoc.toObject();
        invoice.client_name = invoiceDoc.client_id?.name;
        invoice.client_company = invoiceDoc.client_id?.company;
        invoice.client_email = invoiceDoc.client_id?.email;
        invoice.client_address = invoiceDoc.client_id?.address;

        // Fetch line items
        const lineItems = await InvoiceLineItem.find({ invoice_id: invoiceId }).sort({ order: 1 });
        invoice.lineItems = lineItems;

        // Fetch associated time entries
        const timeEntries = await TimeEntry.find({ invoice_id: invoiceId, user_id: userId });
        invoice.timeEntries = timeEntries;

        res.json({ invoice });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/invoices ───────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            client_id, invoice_date, due_date, line_items,
            tax_rate, discount_amount, notes, time_entry_ids,
        } = req.body;

        if (!client_id) return res.status(400).json({ message: 'Client is required.' });
        if (!line_items || !line_items.length) return res.status(400).json({ message: 'At least one line item is required.' });

        // Verify client
        const client = await Client.findOne({ _id: client_id, user_id: req.user._id }).session(session);
        if (!client) throw new Error('Client not found.');

        // Get and increment invoice number atomically the Mongoose way
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { invoice_next_number: 1 } },
            { new: false, session } // Return old version to get the current number
        );

        const invoice_number = `${user.invoice_prefix || 'INV'}-${String(user.invoice_next_number || 1).padStart(4, '0')}`;

        // Calculate totals
        const subtotal = line_items.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.rate)), 0);
        const taxAmt = subtotal * ((parseFloat(tax_rate) || 0) / 100);
        const discountAmt = parseFloat(discount_amount) || 0;
        const total = subtotal + taxAmt - discountAmt;

        // Create invoice
        const [invoice] = await Invoice.create([{
            user_id: req.user._id,
            client_id,
            invoice_number,
            invoice_date: invoice_date || new Date(),
            due_date,
            subtotal,
            tax_rate: tax_rate || 0,
            tax_amount: taxAmt,
            discount_amount: discountAmt,
            total,
            notes,
            status: 'DRAFT'
        }], { session });

        // Create line items
        const lineItemDocs = line_items.map((item, index) => ({
            invoice_id: invoice._id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
            order: index
        }));
        await InvoiceLineItem.insertMany(lineItemDocs, { session });

        // Mark time entries as billed
        if (time_entry_ids && time_entry_ids.length) {
            await TimeEntry.updateMany(
                { _id: { $in: time_entry_ids }, user_id: req.user._id },
                { $set: { is_billed: true, invoice_id: invoice._id } },
                { session }
            );
        }

        await session.commitTransaction();
        res.status(201).json({ message: 'Invoice created successfully', invoice });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
});

// ─── PUT /api/invoices/:id ────────────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
    try {
        const userId = req.user._id;
        const invoiceId = req.params.id;

        const invoice = await Invoice.findOneAndUpdate(
            { _id: invoiceId, user_id: userId },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });

        res.json({ message: 'Invoice updated successfully', invoice });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/invoices/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const invoiceId = req.params.id;

        const invoice = await Invoice.findOne({ _id: invoiceId, user_id: userId }).session(session);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });

        if (invoice.status === 'PAID') {
            return res.status(400).json({ message: 'Cannot delete a paid invoice.' });
        }

        // Unmark time entries as billed
        await TimeEntry.updateMany(
            { invoice_id: invoiceId },
            { $set: { is_billed: false, invoice_id: null } },
            { session }
        );

        // Delete line items
        await InvoiceLineItem.deleteMany({ invoice_id: invoiceId }, { session });

        // Delete invoice
        await Invoice.deleteOne({ _id: invoiceId }, { session });

        await session.commitTransaction();
        res.json({ message: 'Invoice deleted successfully.' });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
});

// ─── PUT /api/invoices/:id/mark-paid ─────────────────────────────────────────
router.put('/:id/mark-paid', async (req, res, next) => {
    try {
        const { payment_date, payment_amount, payment_notes } = req.body;

        const invoice = await Invoice.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user._id },
            {
                $set: {
                    status: 'PAID',
                    payment_date: payment_date || new Date(),
                    payment_amount,
                    payment_notes
                }
            },
            { new: true }
        );

        if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });

        res.json({ message: 'Invoice marked as paid', invoice });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/invoices/:id/send ─────────────────────────────────────────────
router.post('/:id/send', async (req, res, next) => {
    try {
        const userId = req.user._id;
        const invoiceId = req.params.id;

        // Fetch invoice and client email
        const invoiceDoc = await Invoice.findOne({ _id: invoiceId, user_id: userId })
            .populate('client_id', 'email');

        if (!invoiceDoc) return res.status(404).json({ message: 'Invoice not found.' });
        if (!invoiceDoc.client_id?.email) return res.status(400).json({ message: 'Client email is required to send invoice.' });

        // Simulate email dispatch delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update status to SENT if it was DRAFT
        const invoice = await Invoice.findOneAndUpdate(
            { _id: invoiceId, user_id: userId, status: 'DRAFT' },
            { $set: { status: 'SENT' } },
            { new: true }
        ) || invoiceDoc;

        res.json({
            message: `Invoice ${invoice.invoice_number} dispatched to ${invoiceDoc.client_id.email}`,
            invoice
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
