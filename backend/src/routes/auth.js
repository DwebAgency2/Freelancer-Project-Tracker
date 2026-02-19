const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: generate JWT
const generateToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('business_name').notEmpty().withMessage('Business name is required'),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
            }

            const { email, password, business_name } = req.body;

            // Check if user already exists
            const existingUserResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existingUserResult.rows.length > 0) {
                return res.status(409).json({ message: 'An account with this email already exists.' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(12);
            const password_hash = await bcrypt.hash(password, salt);

            // Create user
            const newUserResult = await pool.query(
                'INSERT INTO users (email, password_hash, business_name) VALUES ($1, $2, $3) RETURNING id, email, business_name',
                [email, password_hash, business_name]
            );
            const user = newUserResult.rows[0];

            const token = generateToken(user.id);

            res.status(201).json({
                message: 'Account created successfully',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    business_name: user.business_name,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
            }

            const { email, password } = req.body;

            // Find user
            const result = await pool.query(
                'SELECT id, email, password_hash, business_name, logo_url FROM users WHERE email = $1',
                [email]
            );
            const user = result.rows[0];

            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password.' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password.' });
            }

            const token = generateToken(user.id);

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    business_name: user.business_name,
                    logo_url: user.logo_url,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
