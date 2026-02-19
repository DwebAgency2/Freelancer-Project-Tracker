const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Middleware to protect routes — verifies JWT from Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for Bearer token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized. No token provided.' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from DB (exclude password)
        const result = await pool.query(
            'SELECT id, email, business_name, phone, address, tax_id, logo_url, default_hourly_rate, invoice_prefix, payment_instructions, terms_conditions, default_tax_rate FROM users WHERE id = $1',
            [decoded.id]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Not authorized. User not found.' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Not authorized. Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Not authorized. Token expired.' });
        }
        next(error);
    }
};

module.exports = { protect };
