const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    company: String,
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: String,
    address: String,
    tax_id: String,
    default_hourly_rate: {
        type: Number,
        default: 0
    },
    payment_terms: {
        type: String,
        enum: ['NET_15', 'NET_30', 'NET_45', 'NET_60'],
        default: 'NET_30'
    },
    notes: String,
    is_archived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Client', clientSchema);
