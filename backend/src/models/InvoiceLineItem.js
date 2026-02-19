const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvoiceLineItem = sequelize.define('InvoiceLineItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    invoice_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'invoices', key: 'id' },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1,
    },
    rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'invoice_line_items',
    timestamps: true,
    underscored: true,
    updatedAt: false,
});

module.exports = InvoiceLineItem;
