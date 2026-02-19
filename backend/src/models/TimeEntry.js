const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TimeEntry = sequelize.define('TimeEntry', {
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
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'projects', key: 'id' },
    },
    invoice_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'invoices', key: 'id' },
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    // Duration stored in minutes
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_billable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    is_billed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'time_entries',
    timestamps: true,
    underscored: true,
});

module.exports = TimeEntry;
