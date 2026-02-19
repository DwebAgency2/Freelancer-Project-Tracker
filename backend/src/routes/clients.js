const express = require('express');
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// ─── GET /api/clients ─────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
    try {
        const { search, archived } = req.query;
        const userId = req.user.id;
        const isArchived = archived === 'true';

        let queryText = 'SELECT * FROM clients WHERE user_id = $1 AND is_archived = $2';
        const params = [userId, isArchived];

        if (search) {
            queryText += ' AND (name ILIKE $3 OR company ILIKE $3 OR email ILIKE $3)';
            params.push(`%${search}%`);
        }

        queryText += ' ORDER BY name ASC';

        const result = await pool.query(queryText, params);
        res.json({ clients: result.rows });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/clients/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const clientId = req.params.id;

        // Fetch client
        const clientResult = await pool.query(
            'SELECT * FROM clients WHERE id = $1 AND user_id = $2',
            [clientId, userId]
        );
        const client = clientResult.rows[0];

        if (!client) return res.status(404).json({ message: 'Client not found.' });

        // Fetch associated projects
        const projectsResult = await pool.query(
            'SELECT * FROM projects WHERE client_id = $1 AND user_id = $2 ORDER BY created_at DESC',
            [clientId, userId]
        );
        client.projects = projectsResult.rows;

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

        const result = await pool.query(
            `INSERT INTO clients 
            (user_id, name, company, email, phone, address, tax_id, default_hourly_rate, payment_terms, notes) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [req.user.id, name, company, email, phone, address, tax_id, default_hourly_rate, payment_terms, notes]
        );

        res.status(201).json({ message: 'Client created successfully', client: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// ─── PUT /api/clients/:id ─────────────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const clientId = req.params.id;

        const allowedFields = ['name', 'company', 'email', 'phone', 'address', 'tax_id', 'default_hourly_rate', 'payment_terms', 'notes'];
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

        values.push(clientId, userId);
        const queryText = `UPDATE clients SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${index} AND user_id = $${index + 1} RETURNING *`;

        const result = await pool.query(queryText, values);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Client not found.' });

        res.json({ message: 'Client updated successfully', client: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/clients/:id — soft delete (archive) ─────────────────────────
router.delete('/:id', async (req, res, next) => {
    try {
        const result = await pool.query(
            'UPDATE clients SET is_archived = TRUE, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Client not found.' });

        res.json({ message: 'Client archived successfully.' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
