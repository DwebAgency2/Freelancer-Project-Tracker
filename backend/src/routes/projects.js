const express = require('express');
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ─── GET /api/projects ────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
    try {
        const { status, client_id } = req.query;
        const userId = req.user.id;

        let queryText = `
            SELECT p.*, c.name as client_name, c.company as client_company 
            FROM projects p 
            LEFT JOIN clients c ON p.client_id = c.id 
            WHERE p.user_id = $1
        `;
        const params = [userId];
        let index = 2;

        if (status) {
            queryText += ` AND p.status = $${index}`;
            params.push(status.toUpperCase());
            index++;
        }
        if (client_id) {
            queryText += ` AND p.client_id = $${index}`;
            params.push(client_id);
            index++;
        }

        queryText += ' ORDER BY p.created_at DESC';

        const result = await pool.query(queryText, params);
        res.json({ projects: result.rows });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/projects/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;

        // Fetch project with client info
        const projectResult = await pool.query(
            `SELECT p.*, c.name as client_name, c.company as client_company, c.email as client_email 
             FROM projects p 
             LEFT JOIN clients c ON p.client_id = c.id 
             WHERE p.id = $1 AND p.user_id = $2`,
            [projectId, userId]
        );
        const project = projectResult.rows[0];

        if (!project) return res.status(404).json({ message: 'Project not found.' });

        // Fetch associated time entries
        const timeEntriesResult = await pool.query(
            'SELECT * FROM time_entries WHERE project_id = $1 AND user_id = $2 ORDER BY created_at DESC',
            [projectId, userId]
        );
        project.timeEntries = timeEntriesResult.rows;

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
        const clientCheck = await pool.query('SELECT id FROM clients WHERE id = $1 AND user_id = $2', [client_id, req.user.id]);
        if (clientCheck.rows.length === 0) return res.status(404).json({ message: 'Client not found.' });

        const result = await pool.query(
            `INSERT INTO projects 
            (user_id, client_id, name, description, start_date, deadline, status, budget_type, estimated_budget, billing_rate) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [req.user.id, client_id, name, description, start_date || null, deadline || null, status || 'ACTIVE', budget_type || 'HOURLY', estimated_budget || 0, billing_rate || 0]
        );

        res.status(201).json({ message: 'Project created successfully', project: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// ─── PUT /api/projects/:id ────────────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;

        const allowedFields = ['name', 'client_id', 'description', 'start_date', 'deadline', 'status', 'budget_type', 'estimated_budget', 'billing_rate'];
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

        values.push(projectId, userId);
        const queryText = `UPDATE projects SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${index} AND user_id = $${index + 1} RETURNING *`;

        const result = await pool.query(queryText, values);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found.' });

        res.json({ message: 'Project updated successfully', project: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
    try {
        const result = await pool.query(
            'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found.' });

        res.json({ message: 'Project deleted successfully.' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
