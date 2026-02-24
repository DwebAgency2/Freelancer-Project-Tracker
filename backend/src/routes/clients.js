const express = require('express');
const Client = require('../models/Client');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// ─── GET /api/clients ─────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
    try {
        const { search, archived } = req.query;
        const userId = req.user._id;
        const isArchived = archived === 'true';

        let query = { user_id: userId, is_archived: isArchived };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const clients = await Client.find(query).sort({ name: 1 });
        res.json({ clients });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/clients/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
    try {
        const userId = req.user._id;
        const clientId = req.params.id;

        // Fetch client
        const client = await Client.findOne({ _id: clientId, user_id: userId }).lean();

        if (!client) return res.status(404).json({ message: 'Client not found.' });

        // Fetch associated projects
        const projects = await Project.find({ client_id: clientId, user_id: userId }).sort({ createdAt: -1 });
        client.projects = projects;

        res.json({ client });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/clients ────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
    try {
        const { name, company, email, phone, address, tax_id, default_hourly_rate, payment_terms, notes } = req.body;

        if (!name) return res.status(400).json({ message: 'Client name is required.' });

        const client = await Client.create({
            user_id: req.user._id,
            name,
            company,
            email,
            phone,
            address,
            tax_id,
            default_hourly_rate,
            payment_terms,
            notes
        });

        res.status(201).json({ message: 'Client created successfully', client });
    } catch (error) {
        next(error);
    }
});

// ─── PUT /api/clients/:id ─────────────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
    try {
        const userId = req.user._id;
        const clientId = req.params.id;

        const client = await Client.findOneAndUpdate(
            { _id: clientId, user_id: userId },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!client) return res.status(404).json({ message: 'Client not found.' });

        res.json({ message: 'Client updated successfully', client });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/clients/:id — soft delete (archive) ─────────────────────────
router.delete('/:id', async (req, res, next) => {
    try {
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user._id },
            { $set: { is_archived: true } },
            { new: true }
        );

        if (!client) return res.status(404).json({ message: 'Client not found.' });

        res.json({ message: 'Client archived successfully.' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
