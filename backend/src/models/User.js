const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password_hash: {
        type: String,
        required: true
    },
    business_name: {
        type: String,
        trim: true
    },
    phone: String,
    address: String,
    tax_id: String,
    logo_url: String,
    default_hourly_rate: {
        type: Number,
        default: 0
    },
    invoice_prefix: {
        type: String,
        default: 'INV'
    },
    invoice_next_number: {
        type: Number,
        default: 1
    },
    payment_instructions: String,
    terms_conditions: String,
    default_tax_rate: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Virtual for id to match Sequelize interface if needed
userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('User', userSchema);
