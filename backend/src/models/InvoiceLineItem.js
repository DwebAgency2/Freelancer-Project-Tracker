const mongoose = require('mongoose');

const invoiceLineItemSchema = new mongoose.Schema({
    invoice_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    rate: {
        type: Number,
        default: 0
    },
    amount: {
        type: Number,
        default: 0
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('InvoiceLineItem', invoiceLineItemSchema);
