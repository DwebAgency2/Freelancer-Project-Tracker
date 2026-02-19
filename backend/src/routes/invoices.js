const express = require('express');
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ─── GET /api/invoices/next-number ────────────────────────────────────────────
router.get('/next-number', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT invoice_prefix, invoice_next_number FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];
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
        const userId = req.user.id;

        // Auto-mark overdue invoices
        await pool.query(
            "UPDATE invoices SET status = 'OVERDUE' WHERE user_id = $1 AND status = 'SENT' AND due_date < NOW()",
            [userId]
        );

        let queryText = `
            SELECT i.*, c.name as client_name, c.company as client_company 
            FROM invoices i 
            LEFT JOIN clients c ON i.client_id = c.id 
            WHERE i.user_id = $1
        `;
        const params = [userId];
        let index = 2;

        if (status) {
            queryText += ` AND i.status = $${index}`;
            params.push(status.toUpperCase());
            index++;
        }
        if (client_id) {
            queryText += ` AND i.client_id = $${index}`;
            params.push(client_id);
            index++;
        }
        if (start_date) {
            queryText += ` AND i.invoice_date >= $${index}`;
            params.push(start_date);
            index++;
        }
        if (end_date) {
            queryText += ` AND i.invoice_date <= $${index}`;
            params.push(end_date);
            index++;
        }

        queryText += ' ORDER BY i.invoice_date DESC, i.created_at DESC';

        const result = await pool.query(queryText, params);
        res.json({ invoices: result.rows });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/invoices/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const invoiceId = req.params.id;

        const invResult = await pool.query(
            `SELECT i.*, c.name as client_name, c.company as client_company, c.email as client_email, c.address as client_address 
             FROM invoices i 
             LEFT JOIN clients c ON i.client_id = c.id 
             WHERE i.id = $1 AND i.user_id = $2`,
            [invoiceId, userId]
        );
        const invoice = invResult.rows[0];

        if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });

        // Fetch line items
        const itemsResult = await pool.query(
            'SELECT * FROM invoice_line_items WHERE invoice_id = $1 ORDER BY id ASC',
            [invoiceId]
        );
        invoice.lineItems = itemsResult.rows;

        // Fetch associated time entries
        const timeResult = await pool.query(
            'SELECT * FROM time_entries WHERE invoice_id = $1 AND user_id = $2',
            [invoiceId, userId]
        );
        invoice.timeEntries = timeResult.rows;

        res.json({ invoice });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/invoices ───────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
    const client_db = await pool.connect();
    try {
        await client_db.query('BEGIN');
        const {
            client_id, invoice_date, due_date, line_items,
            tax_rate, discount_amount, notes, time_entry_ids,
        } = req.body;

        if (!client_id) return res.status(400).json({ message: 'Client is required.' });
        if (!line_items || !line_items.length) return res.status(400).json({ message: 'At least one line item is required.' });

        // Verify client
        const clientCheck = await client_db.query('SELECT id FROM clients WHERE id = $1 AND user_id = $2', [client_id, req.user.id]);
        if (clientCheck.rows.length === 0) throw new Error('Client not found.');

        // Get and increment invoice number
        const userResult = await client_db.query('SELECT invoice_prefix, invoice_next_number FROM users WHERE id = $1 FOR UPDATE', [req.user.id]);
        const user = userResult.rows[0];
        const invoice_number = `${user.invoice_prefix || 'INV'}-${String(user.invoice_next_number || 1).padStart(4, '0')}`;

        await client_db.query('UPDATE users SET invoice_next_number = invoice_next_number + 1 WHERE id = $1', [req.user.id]);

        // Calculate totals
        const subtotal = line_items.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.rate)), 0);
        const taxAmt = subtotal * ((parseFloat(tax_rate) || 0) / 100);
        const discountAmt = parseFloat(discount_amount) || 0;
        const total = subtotal + taxAmt - discountAmt;

        // Create invoice
        const invoiceResult = await client_db.query(
            `INSERT INTO invoices 
            (user_id, client_id, invoice_number, invoice_date, due_date, subtotal, tax_rate, tax_amount, discount_amount, total, notes, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'DRAFT') 
            RETURNING *`,
            [req.user.id, client_id, invoice_number, invoice_date || new Date(), due_date, subtotal, tax_rate || 0, taxAmt, discountAmt, total, notes]
        );
        const invoice = invoiceResult.rows[0];

        // Create line items
        for (const item of line_items) {
            await client_db.query(
                `INSERT INTO invoice_line_items (invoice_id, description, quantity, rate, amount) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [invoice.id, item.description, item.quantity, item.rate, (item.quantity * item.rate)]
            );
        }

        // Mark time entries as billed
        if (time_entry_ids && time_entry_ids.length) {
            await client_db.query(
                'UPDATE time_entries SET is_billed = TRUE, invoice_id = $1 WHERE id = ANY($2) AND user_id = $3',
                [invoice.id, time_entry_ids, req.user.id]
            );
        }

        await client_db.query('COMMIT');
        res.status(201).json({ message: 'Invoice created successfully', invoice });
    } catch (error) {
        await client_db.query('ROLLBACK');
        next(error);
    } finally {
        client_db.release();
    }
});

// ─── PUT /api/invoices/:id ────────────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const invoiceId = req.params.id;

        const allowedFields = ['invoice_date', 'due_date', 'tax_rate', 'tax_amount', 'discount_amount', 'subtotal', 'total', 'notes', 'status'];
        const updates = [];
        const values = [];
        let index = 1;

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = $${index}`);
                values.push(req.body[field]);
                index++;
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }

        values.push(invoiceId, userId);
        const queryText = `UPDATE invoices SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${index} AND user_id = $${index + 1} RETURNING *`;

        const result = await pool.query(queryText, values);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Invoice not found.' });

        res.json({ message: 'Invoice updated successfully', invoice: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/invoices/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
    const client_db = await pool.connect();
    try {
        await client_db.query('BEGIN');
        const userId = req.user.id;
        const invoiceId = req.params.id;

        const invResult = await client_db.query('SELECT status FROM invoices WHERE id = $1 AND user_id = $2', [invoiceId, userId]);
        const invoice = invResult.rows[0];

        if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });

        if (invoice.status === 'PAID') {
            return res.status(400).json({ message: 'Cannot delete a paid invoice.' });
        }

        // Unmark time entries as billed
        await client_db.query(
            'UPDATE time_entries SET is_billed = FALSE, invoice_id = NULL WHERE invoice_id = $1',
            [invoiceId]
        );

        await client_db.query('DELETE FROM invoices WHERE id = $1 AND user_id = $2', [invoiceId, userId]);

        await client_db.query('COMMIT');
        res.json({ message: 'Invoice deleted successfully.' });
    } catch (error) {
        await client_db.query('ROLLBACK');
        next(error);
    } finally {
        client_db.release();
    }
});

// ─── PUT /api/invoices/:id/mark-paid ─────────────────────────────────────────
router.put('/:id/mark-paid', async (req, res, next) => {
    try {
        const { payment_date, payment_amount, payment_notes } = req.body;

        const result = await pool.query(
            `UPDATE invoices 
             SET status = 'PAID', payment_date = $1, payment_amount = $2, payment_notes = $3, updated_at = NOW() 
             WHERE id = $4 AND user_id = $5 RETURNING *`,
            [payment_date || new Date(), payment_amount, payment_notes, req.params.id, req.user.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Invoice not found.' });

        res.json({ message: 'Invoice marked as paid', invoice: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
