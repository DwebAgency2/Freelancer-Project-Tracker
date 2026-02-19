const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'clients', key: 'id' },
    },
    invoice_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    invoice_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    tax_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
    },
    tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE'),
        allowNull: false,
        defaultValue: 'DRAFT',
    },
    payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    payment_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    payment_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    pdf_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'invoices',
    timestamps: true,
    underscored: true,
});

module.exports = Invoice;
