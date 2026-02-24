const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    duration_minutes: {
        type: Number,
        default: 0
    },
    hourly_rate: {
        type: Number,
        default: 0
    },
    total_amount: {
        type: Number,
        default: 0
    },
    is_invoiced: {
        type: Boolean,
        default: false
    },
    invoice_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TimeEntry', timeEntrySchema);
