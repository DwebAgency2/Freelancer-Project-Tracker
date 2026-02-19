require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { pool } = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const clientRoutes = require('./src/routes/clients');
const projectRoutes = require('./src/routes/projects');
const timeEntryRoutes = require('./src/routes/timeEntries');
const invoiceRoutes = require('./src/routes/invoices');
const dashboardRoutes = require('./src/routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Ensure upload directories exist ─────────────────────────────────────────
const uploadDirs = ['uploads', 'uploads/logos'];
uploadDirs.forEach((dir) => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT NOW()');
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: error.message
        });
    }
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.url} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
    try {
        // Test database connection
        await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully (PostgreSQL).');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
