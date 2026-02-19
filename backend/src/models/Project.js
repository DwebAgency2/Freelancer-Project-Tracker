const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
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
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    deadline: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
    },
    budget_type: {
        type: DataTypes.ENUM('HOURLY', 'FIXED_PRICE'),
        allowNull: false,
        defaultValue: 'HOURLY',
    },
    estimated_budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    billing_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
}, {
    tableName: 'projects',
    timestamps: true,
    underscored: true,
});

module.exports = Project;
