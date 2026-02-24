const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
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
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    start_date: Date,
    deadline: Date,
    status: {
        type: String,
        enum: ['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED'],
        default: 'ACTIVE'
    },
    budget_type: {
        type: String,
        enum: ['HOURLY', 'FIXED_PRICE'],
        default: 'HOURLY'
    },
    estimated_budget: {
        type: Number,
        default: 0
    },
    billing_rate: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
