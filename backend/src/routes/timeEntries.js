const express = require('express');
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ─── GET /api/time-entries ────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
    try {
        const { project_id, client_id, start_date, end_date, is_billable, is_billed } = req.query;
        const userId = req.user.id;

        let queryText = `
            SELECT t.*, p.name as project_name, c.name as client_name 
            FROM time_entries t 
            LEFT JOIN projects p ON t.project_id = p.id 
            LEFT JOIN clients c ON p.client_id = c.id 
            WHERE t.user_id = $1
        `;
        const params = [userId];
        let index = 2;

        if (project_id) {
            queryText += ` AND t.project_id = $${index}`;
            params.push(project_id);
            index++;
        }
        if (client_id) {
            queryText += ` AND p.client_id = $${index}`;
            params.push(client_id);
            index++;
        }
        if (is_billable !== undefined) {
            queryText += ` AND t.is_billable = $${index}`;
            params.push(is_billable === 'true');
            index++;
        }
        if (is_billed !== undefined) {
            queryText += ` AND t.is_billed = $${index}`;
            params.push(is_billed === 'true');
            index++;
        }
        if (start_date) {
            queryText += ` AND t.date >= $${index}`;
            params.push(start_date);
            index++;
        }
        if (end_date) {
            queryText += ` AND t.date <= $${index}`;
            params.push(end_date);
            index++;
        }

        queryText += ' ORDER BY t.date DESC, t.created_at DESC';

        const result = await pool.query(queryText, params);
        res.json({ entries: result.rows });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/time-entries/summary ───────────────────────────────────────────
router.get('/summary', async (req, res, next) => {
    try {
        const { project_id, start_date, end_date } = req.query;
        const userId = req.user.id;

        let queryText = 'SELECT * FROM time_entries WHERE user_id = $1';
        const params = [userId];
        let index = 2;

        if (project_id) {
            queryText += ` AND project_id = $${index}`;
            params.push(project_id);
            index++;
        }
        if (start_date) {
            queryText += ` AND date >= $${index}`;
            params.push(start_date);
            index++;
        }
        if (end_date) {
            queryText += ` AND date <= $${index}`;
            params.push(end_date);
            index++;
        }

        const result = await pool.query(queryText, params);
        const entries = result.rows;

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
        const result = await pool.query(
            `SELECT t.*, p.name as project_name 
             FROM time_entries t 
             LEFT JOIN projects p ON t.project_id = p.id 
             WHERE t.id = $1 AND t.user_id = $2`,
            [req.params.id, req.user.id]
        );
        const entry = result.rows[0];

        if (!entry) return res.status(404).json({ message: 'Time entry not found.' });
        res.json({ entry });
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
        const projectCheck = await pool.query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [project_id, req.user.id]);
        if (projectCheck.rows.length === 0) return res.status(404).json({ message: 'Project not found.' });

        // Calculate duration from start/end times if not provided directly
        let finalDuration = duration || 0;
        if (!finalDuration && start_time && end_time) {
            const [sh, sm] = start_time.split(':').map(Number);
            const [eh, em] = end_time.split(':').map(Number);
            finalDuration = (eh * 60 + em) - (sh * 60 + sm);
            if (finalDuration < 0) finalDuration += 24 * 60; // handle overnight
        }

        const result = await pool.query(
            `INSERT INTO time_entries 
            (user_id, project_id, date, start_time, end_time, duration_minutes, description, is_billable) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [req.user.id, project_id, date, start_time, end_time, finalDuration, description, is_billable !== undefined ? is_billable : true]
        );

        res.status(201).json({ message: 'Time entry created successfully', entry: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// ─── PUT /api/time-entries/:id ────────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const entryId = req.params.id;

        const entryCheck = await pool.query('SELECT * FROM time_entries WHERE id = $1 AND user_id = $2', [entryId, userId]);
        const entry = entryCheck.rows[0];

        if (!entry) return res.status(404).json({ message: 'Time entry not found.' });

        // Cannot edit billed entries
        if (entry.is_billed) {
            return res.status(400).json({ message: 'Cannot edit a billed time entry.' });
        }

        const allowedFields = ['project_id', 'date', 'start_time', 'end_time', 'duration_minutes', 'description', 'is_billable'];
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

        // Recalculate duration if times changed
        const st = (req.body.start_time !== undefined) ? req.body.start_time : entry.start_time;
        const et = (req.body.end_time !== undefined) ? req.body.end_time : entry.end_time;

        if ((req.body.start_time !== undefined || req.body.end_time !== undefined) && st && et && req.body.duration_minutes === undefined) {
            const [sh, sm] = st.split(':').map(Number);
            const [eh, em] = et.split(':').map(Number);
            let newDuration = (eh * 60 + em) - (sh * 60 + sm);
            if (newDuration < 0) newDuration += 24 * 60;

            updates.push(`duration_minutes = $${index}`);
            values.push(newDuration);
            index++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }

        values.push(entryId, userId);
        const queryText = `UPDATE time_entries SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${index} AND user_id = $${index + 1} RETURNING *`;

        const result = await pool.query(queryText, values);
        res.json({ message: 'Time entry updated successfully', entry: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/time-entries/:id ─────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const entryId = req.params.id;

        const entryCheck = await pool.query('SELECT is_billed FROM time_entries WHERE id = $1 AND user_id = $2', [entryId, userId]);
        const entry = entryCheck.rows[0];

        if (!entry) return res.status(404).json({ message: 'Time entry not found.' });

        if (entry.is_billed) {
            return res.status(400).json({ message: 'Cannot delete a billed time entry.' });
        }

        await pool.query('DELETE FROM time_entries WHERE id = $1 AND user_id = $2', [entryId, userId]);
        res.json({ message: 'Time entry deleted successfully.' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
