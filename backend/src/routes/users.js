const express = require('express');
const multer = require('multer');
const User = require('../models/User');
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
        public_id: (req, file) => `logo-${req.user._id}-${Date.now()}`,
    },
});

const upload = multer({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

// ─── GET /api/user/profile ────────────────────────────────────────────────────
router.get('/profile', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password_hash');
        res.json({ user });
    } catch (error) {
        next(error);
    }
});

// ─── PUT /api/user/profile ────────────────────────────────────────────────────
router.put('/profile', protect, async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select('-password_hash');

        res.json({ message: 'Profile updated successfully', user });
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

        const logo_url = req.file.path;
        await User.findByIdAndUpdate(req.user._id, { $set: { logo_url } });

        res.json({ message: 'Logo uploaded successfully', logo_url });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
