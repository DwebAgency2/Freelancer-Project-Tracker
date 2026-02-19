-- Database Initialization Script for Freelancer Project Tracker
-- NOTE: Running this will drop existing data. Backup if necessary.

DROP TABLE IF EXISTS invoice_line_items CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    business_name VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(100),
    logo_url VARCHAR(255),
    default_hourly_rate DECIMAL(10, 2) DEFAULT 0.00,
    invoice_prefix VARCHAR(50) DEFAULT 'INV',
    invoice_next_number INTEGER DEFAULT 1,
    payment_instructions TEXT,
    terms_conditions TEXT,
    default_tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clients table
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(100),
    default_hourly_rate DECIMAL(10, 2),
    payment_terms VARCHAR(255),
    notes TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, ARCHIVED
    start_date DATE,
    deadline DATE,
    budget_type VARCHAR(50) DEFAULT 'HOURLY', -- HOURLY, FIXED
    billing_rate DECIMAL(10, 2),
    estimated_budget DECIMAL(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id),
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SENT, PAID, OVERDUE, CANCELLED
    subtotal DECIMAL(15, 2) DEFAULT 0.00,
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    total DECIMAL(15, 2) DEFAULT 0.00,
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_amount DECIMAL(15, 2),
    payment_notes TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Time Entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE SET NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time VARCHAR(20),
    end_time VARCHAR(20),
    duration_minutes INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10, 2),
    is_billable BOOLEAN DEFAULT TRUE,
    is_billed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Invoice Line Items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1.00,
    rate DECIMAL(15, 2) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
