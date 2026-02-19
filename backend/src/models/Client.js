const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
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
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    company: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isEmail: true },
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
    default_hourly_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    payment_terms: {
        type: DataTypes.ENUM('NET_15', 'NET_30', 'NET_45', 'NET_60'),
        allowNull: true,
        defaultValue: 'NET_30',
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'clients',
    timestamps: true,
    underscored: true,
});

module.exports = Client;
