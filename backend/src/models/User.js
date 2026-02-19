const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    business_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    tax_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    logo_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    default_hourly_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
    },
    invoice_prefix: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'INV',
    },
    invoice_next_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    payment_instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    terms_conditions: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    default_tax_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
    },
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
});

module.exports = User;
