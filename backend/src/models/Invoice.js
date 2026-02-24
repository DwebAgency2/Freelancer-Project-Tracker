const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    invoice_number: {
        type: String,
        required: true
    },
    invoice_date: {
        type: Date,
        required: true,
        default: Date.now
    },
    due_date: Date,
    subtotal: {
        type: Number,
        default: 0
    },
    tax_rate: {
        type: Number,
        default: 0
    },
    tax_amount: {
        type: Number,
        default: 0
    },
    discount_amount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE'],
        default: 'DRAFT'
    },
    payment_date: Date,
    payment_amount: Number,
    payment_notes: String,
    notes: String,
    pdf_url: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);
