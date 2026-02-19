const sequelize = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const Project = require('./Project');
const TimeEntry = require('./TimeEntry');
const Invoice = require('./Invoice');
const InvoiceLineItem = require('./InvoiceLineItem');

// ─── Associations ────────────────────────────────────────────────────────────

// User → Clients (one-to-many)
User.hasMany(Client, { foreignKey: 'user_id', as: 'clients', onDelete: 'CASCADE' });
Client.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User → Projects (one-to-many)
User.hasMany(Project, { foreignKey: 'user_id', as: 'projects', onDelete: 'CASCADE' });
Project.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Client → Projects (one-to-many)
Client.hasMany(Project, { foreignKey: 'client_id', as: 'projects', onDelete: 'CASCADE' });
Project.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// User → TimeEntries (one-to-many)
User.hasMany(TimeEntry, { foreignKey: 'user_id', as: 'timeEntries', onDelete: 'CASCADE' });
TimeEntry.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Project → TimeEntries (one-to-many)
Project.hasMany(TimeEntry, { foreignKey: 'project_id', as: 'timeEntries', onDelete: 'CASCADE' });
TimeEntry.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// User → Invoices (one-to-many)
User.hasMany(Invoice, { foreignKey: 'user_id', as: 'invoices', onDelete: 'CASCADE' });
Invoice.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Client → Invoices (one-to-many)
Client.hasMany(Invoice, { foreignKey: 'client_id', as: 'invoices' });
Invoice.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Invoice → TimeEntries (one-to-many, nullable)
Invoice.hasMany(TimeEntry, { foreignKey: 'invoice_id', as: 'timeEntries' });
TimeEntry.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });

// Invoice → InvoiceLineItems (one-to-many)
Invoice.hasMany(InvoiceLineItem, { foreignKey: 'invoice_id', as: 'lineItems', onDelete: 'CASCADE' });
InvoiceLineItem.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });

module.exports = {
    sequelize,
    User,
    Client,
    Project,
    TimeEntry,
    Invoice,
    InvoiceLineItem,
};
