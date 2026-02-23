const express = require('express');
const path = require('path');
const multer = require('multer');
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ─── Cloudinary configuration ──────────────────────────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'zentrack/logos',
        allowed_formats: ['jpg', 'png', 'jpeg', 'svg', 'gif'],
        public_id: (req, file) => `logo-${req.user.id}-${Date.now()}`,
    },
});

const upload = multer({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
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

        const logo_url = req.file.path; // cloudinary-storage sets path as the secure_url
        await pool.query('UPDATE users SET logo_url = $1, updated_at = NOW() WHERE id = $2', [logo_url, req.user.id]);

        res.json({ message: 'Logo uploaded successfully', logo_url });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
