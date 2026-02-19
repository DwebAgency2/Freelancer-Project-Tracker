const express = require('express');
const path = require('path');
const multer = require('multer');
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── Multer config for logo uploads ──────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/logos'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `logo-${req.user.id}-${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|svg/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, svg)'));
    },
});

// ─── GET /api/user/profile ────────────────────────────────────────────────────
router.get('/profile', protect, async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT id, email, business_name, phone, address, tax_id, logo_url, default_hourly_rate, invoice_prefix, payment_instructions, terms_conditions, default_tax_rate FROM users WHERE id = $1',
            [req.user.id]
        );
        res.json({ user: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// ─── PUT /api/user/profile ────────────────────────────────────────────────────
router.put('/profile', protect, async (req, res, next) => {
    try {
        const allowedFields = [
            'business_name', 'phone', 'address', 'tax_id',
            'default_hourly_rate', 'invoice_prefix', 'payment_instructions',
            'terms_conditions', 'default_tax_rate',
        ];

        const updates = [];
        const values = [];
        let index = 1;

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = $${index}`);
                values.push(req.body[field]);
                index++;
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }

        values.push(req.user.id);
        const queryText = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${index} RETURNING id, email, business_name, phone, address, tax_id, logo_url, default_hourly_rate, invoice_prefix, payment_instructions, terms_conditions, default_tax_rate`;

        const result = await pool.query(queryText, values);

        res.json({ message: 'Profile updated successfully', user: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/user/logo ──────────────────────────────────────────────────────
router.post('/logo', protect, upload.single('logo'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const logo_url = `/uploads/logos/${req.file.filename}`;
        await pool.query('UPDATE users SET logo_url = $1, updated_at = NOW() WHERE id = $2', [logo_url, req.user.id]);

        res.json({ message: 'Logo uploaded successfully', logo_url });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
