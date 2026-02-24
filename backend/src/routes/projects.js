const express = require('express');
const Project = require('../models/Project');
const Client = require('../models/Client');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ─── GET /api/projects ────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
    try {
        const { status, client_id } = req.query;
        const userId = req.user._id;

        let query = { user_id: userId };

        if (status) {
            query.status = status.toUpperCase();
        }
        if (client_id) {
            query.client_id = client_id;
        }

        const projects = await Project.find(query)
            .populate('client_id', 'name company')
            .sort({ createdAt: -1 });

        // Map client_id fields to match expected frontend format
        const formattedProjects = projects.map(p => ({
            ...p.toObject(),
            client_name: p.client_id?.name,
            client_company: p.client_id?.company
        }));

        res.json({ projects: formattedProjects });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/projects/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
    try {
        const userId = req.user._id;
        const projectId = req.params.id;

        // Fetch project with client info
        const projectDoc = await Project.findOne({ _id: projectId, user_id: userId })
            .populate('client_id', 'name company email');

        if (!projectDoc) return res.status(404).json({ message: 'Project not found.' });

        // Convert to object to add dynamic fields
        const project = projectDoc.toObject();
        project.client_name = projectDoc.client_id?.name;
        project.client_company = projectDoc.client_id?.company;
        project.client_email = projectDoc.client_id?.email;

        // Fetch associated time entries
        const TimeEntry = require('../models/TimeEntry');
        const timeEntries = await TimeEntry.find({ project_id: projectId, user_id: userId }).sort({ createdAt: -1 });
        project.timeEntries = timeEntries;

        res.json({ project });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/projects ───────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
    try {
        const { name, client_id, description, start_date, deadline, status, budget_type, estimated_budget, billing_rate } = req.body;

        if (!name) return res.status(400).json({ message: 'Project name is required.' });
        if (!client_id) return res.status(400).json({ message: 'Client is required.' });

        // Verify client belongs to this user
        const client = await Client.findOne({ _id: client_id, user_id: req.user._id });
        if (!client) return res.status(404).json({ message: 'Client not found.' });

        const project = await Project.create({
            user_id: req.user._id,
            client_id,
            name,
            description,
            start_date: start_date || null,
            deadline: deadline || null,
            status: status || 'ACTIVE',
            budget_type: budget_type || 'HOURLY',
            estimated_budget: estimated_budget || 0,
            billing_rate: billing_rate || 0
        });

        res.status(201).json({ message: 'Project created successfully', project });
    } catch (error) {
        next(error);
    }
});

// ─── PUT /api/projects/:id ────────────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
    try {
        const userId = req.user._id;
        const projectId = req.params.id;

        const project = await Project.findOneAndUpdate(
            { _id: projectId, user_id: userId },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!project) return res.status(404).json({ message: 'Project not found.' });

        res.json({ message: 'Project updated successfully', project });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });

        if (!project) return res.status(404).json({ message: 'Project not found.' });

        res.json({ message: 'Project deleted successfully.' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
