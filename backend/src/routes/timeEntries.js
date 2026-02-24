const express = require('express');
const TimeEntry = require('../models/TimeEntry');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ─── GET /api/time-entries ────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
    try {
        const { project_id, client_id, start_date, end_date, is_billable, is_billed } = req.query;
        const userId = req.user._id;

        let query = { user_id: userId };

        if (project_id) {
            query.project_id = project_id;
        }
        if (is_billable !== undefined) {
            query.is_billable = is_billable === 'true';
        }
        if (is_billed !== undefined) {
            query.is_billed = is_billed === 'true';
        }
        if (start_date || end_date) {
            query.date = {};
            if (start_date) query.date.$gte = new Date(start_date);
            if (end_date) query.date.$lte = new Date(end_date);
        }

        // For client_id filter, we need to find projects for that client first or use populate+filter
        if (client_id) {
            const projects = await Project.find({ client_id, user_id: userId }).select('_id');
            const projectIds = projects.map(p => p._id);
            query.project_id = { $in: projectIds };
        }

        const entries = await TimeEntry.find(query)
            .populate({
                path: 'project_id',
                populate: { path: 'client_id', select: 'name' }
            })
            .sort({ date: -1, createdAt: -1 });

        // Format for frontend expectation
        const formattedEntries = entries.map(e => ({
            ...e.toObject(),
            project_name: e.project_id?.name,
            client_name: e.project_id?.client_id?.name
        }));

        res.json({ entries: formattedEntries });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/time-entries/summary ───────────────────────────────────────────
router.get('/summary', async (req, res, next) => {
    try {
        const { project_id, start_date, end_date } = req.query;
        const userId = req.user._id;

        let query = { user_id: userId };
        if (project_id) query.project_id = project_id;
        if (start_date || end_date) {
            query.date = {};
            if (start_date) query.date.$gte = new Date(start_date);
            if (end_date) query.date.$lte = new Date(end_date);
        }

        const entries = await TimeEntry.find(query);

        const totalMinutes = entries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
        const billableMinutes = entries.filter((e) => e.is_billable).reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
        const unbilledMinutes = entries.filter((e) => e.is_billable && !e.is_billed).reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

        res.json({
            total_hours: +(totalMinutes / 60).toFixed(2),
            billable_hours: +(billableMinutes / 60).toFixed(2),
            unbilled_hours: +(unbilledMinutes / 60).toFixed(2),
            total_entries: entries.length,
        });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/time-entries/:id ────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
    try {
        const entry = await TimeEntry.findOne({ _id: req.params.id, user_id: req.user._id })
            .populate('project_id', 'name');

        if (!entry) return res.status(404).json({ message: 'Time entry not found.' });

        const formattedEntry = entry.toObject();
        formattedEntry.project_name = entry.project_id?.name;

        res.json({ entry: formattedEntry });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/time-entries ───────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
    try {
        const { project_id, date, start_time, end_time, duration, description, is_billable } = req.body;

        if (!project_id) return res.status(400).json({ message: 'Project is required.' });
        if (!date) return res.status(400).json({ message: 'Date is required.' });

        // Verify project belongs to user
        const project = await Project.findOne({ _id: project_id, user_id: req.user._id });
        if (!project) return res.status(404).json({ message: 'Project not found.' });

        // Calculate duration if needed
        let finalDuration = duration || 0;
        if (!finalDuration && start_time && end_time) {
            const [sh, sm] = start_time.split(':').map(Number);
            const [eh, em] = end_time.split(':').map(Number);
            finalDuration = (eh * 60 + em) - (sh * 60 + sm);
            if (finalDuration < 0) finalDuration += 24 * 60;
        }

        const entry = await TimeEntry.create({
            user_id: req.user._id,
            project_id,
            date,
            start_time,
            end_time,
            duration_minutes: finalDuration,
            description,
            is_billable: is_billable !== undefined ? is_billable : true
        });

        res.status(201).json({ message: 'Time entry created successfully', entry });
    } catch (error) {
        next(error);
    }
});

// ─── PUT /api/time-entries/:id ────────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
    try {
        const userId = req.user._id;
        const entryId = req.params.id;

        const entry = await TimeEntry.findOne({ _id: entryId, user_id: userId });
        if (!entry) return res.status(404).json({ message: 'Time entry not found.' });

        if (entry.is_billed) {
            return res.status(400).json({ message: 'Cannot edit a billed time entry.' });
        }

        // Handle duration recalculation if times changed
        if ((req.body.start_time !== undefined || req.body.end_time !== undefined) && req.body.duration_minutes === undefined) {
            const st = req.body.start_time !== undefined ? req.body.start_time : entry.start_time;
            const et = req.body.end_time !== undefined ? req.body.end_time : entry.end_time;

            if (st && et) {
                const [sh, sm] = st.split(':').map(Number);
                const [eh, em] = et.split(':').map(Number);
                let newDuration = (eh * 60 + em) - (sh * 60 + sm);
                if (newDuration < 0) newDuration += 24 * 60;
                req.body.duration_minutes = newDuration;
            }
        }

        const updatedEntry = await TimeEntry.findOneAndUpdate(
            { _id: entryId, user_id: userId },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json({ message: 'Time entry updated successfully', entry: updatedEntry });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/time-entries/:id ─────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
    try {
        const entry = await TimeEntry.findOne({ _id: req.params.id, user_id: req.user._id });
        if (!entry) return res.status(404).json({ message: 'Time entry not found.' });

        if (entry.is_billed) {
            return res.status(400).json({ message: 'Cannot delete a billed time entry.' });
        }

        await TimeEntry.deleteOne({ _id: req.params.id });
        res.json({ message: 'Time entry deleted successfully.' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
