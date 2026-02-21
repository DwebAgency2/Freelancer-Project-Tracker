const express = require('express');
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ─── GET /api/dashboard/stats ─────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // 0. Total clients count
        const clientsCountResult = await pool.query(
            "SELECT COUNT(*) FROM clients WHERE user_id = $1 AND is_archived = FALSE",
            [userId]
        );
        const totalClientsCount = parseInt(clientsCountResult.rows[0].count);

        // 1. Total earnings this month (paid invoices)
        const earningsResult = await pool.query(
            "SELECT SUM(total) as total FROM invoices WHERE user_id = $1 AND status = 'PAID' AND invoice_date >= $2 AND invoice_date <= $3",
            [userId, startOfMonth, endOfMonth]
        );
        const totalEarnings = parseFloat(earningsResult.rows[0].total || 0);

        // 2. Outstanding amount (SENT + OVERDUE)
        const outstandingResult = await pool.query(
            "SELECT SUM(total) as total FROM invoices WHERE user_id = $1 AND status IN ('SENT', 'OVERDUE')",
            [userId]
        );
        const outstandingAmount = parseFloat(outstandingResult.rows[0].total || 0);

        // 3. Hours logged this month
        const hoursResult = await pool.query(
            "SELECT SUM(duration_minutes) as total FROM time_entries WHERE user_id = $1 AND date >= $2 AND date <= $3",
            [userId, startOfMonth, endOfMonth]
        );
        const hoursThisMonth = (parseFloat(hoursResult.rows[0].total || 0) / 60);

        // 4. Active projects count
        const projectsResult = await pool.query(
            "SELECT COUNT(*) FROM projects WHERE user_id = $1 AND status = 'ACTIVE'",
            [userId]
        );
        const activeProjectsCount = parseInt(projectsResult.rows[0].count);

        // 5. Overdue invoices
        const overdueResult = await pool.query(
            `SELECT i.*, c.name as client_name 
             FROM invoices i 
             LEFT JOIN clients c ON i.client_id = c.id 
             WHERE i.user_id = $1 AND i.status = 'OVERDUE' 
             ORDER BY i.due_date ASC`,
            [userId]
        );

        // 6. Upcoming deadlines
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const deadlineResult = await pool.query(
            `SELECT p.*, c.name as client_name 
             FROM projects p 
             LEFT JOIN clients c ON p.client_id = c.id 
             WHERE p.user_id = $1 AND p.status = 'ACTIVE' AND p.deadline BETWEEN $2 AND $3 
             ORDER BY p.deadline ASC LIMIT 5`,
            [userId, now, thirtyDaysFromNow]
        );

        res.json({
            stats: {
                total_clients: totalClientsCount,
                total_earnings: +totalEarnings.toFixed(2),
                outstanding_amount: +outstandingAmount.toFixed(2),
                hours_this_month: +hoursThisMonth.toFixed(1),
                active_projects: activeProjectsCount,
            },
            overdue_invoices: overdueResult.rows,
            upcoming_deadlines: deadlineResult.rows,
        });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/dashboard/activity ─────────────────────────────────────────────
router.get('/activity', async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Recent invoices
        const invResult = await pool.query(
            `SELECT i.*, c.name as client_name 
             FROM invoices i 
             LEFT JOIN clients c ON i.client_id = c.id 
             WHERE i.user_id = $1 
             ORDER BY i.created_at DESC LIMIT 5`,
            [userId]
        );

        // Recent time entries
        const timeResult = await pool.query(
            `SELECT t.*, p.name as project_name 
             FROM time_entries t 
             LEFT JOIN projects p ON t.project_id = p.id 
             WHERE t.user_id = $1 
             ORDER BY t.created_at DESC LIMIT 5`,
            [userId]
        );

        res.json({
            recent_invoices: invResult.rows,
            recent_time_entries: timeResult.rows
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
