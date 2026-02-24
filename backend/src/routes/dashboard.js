const express = require('express');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const TimeEntry = require('../models/TimeEntry');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ─── GET /api/dashboard/stats ─────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // 0. Total clients count
        const totalClientsCount = await Client.countDocuments({ user_id: userId, is_archived: false });

        // 1. Total earnings this month (paid invoices)
        const earningsResult = await Invoice.aggregate([
            { $match: { user_id: userId, status: 'PAID', invoice_date: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        const totalEarnings = earningsResult.length > 0 ? earningsResult[0].total : 0;

        // 2. Outstanding amount (SENT + OVERDUE)
        const outstandingResult = await Invoice.aggregate([
            { $match: { user_id: userId, status: { $in: ['SENT', 'OVERDUE'] } } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        const outstandingAmount = outstandingResult.length > 0 ? outstandingResult[0].total : 0;

        // 3. Hours logged this month
        const hoursResult = await TimeEntry.aggregate([
            { $match: { user_id: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, total: { $sum: "$duration_minutes" } } }
        ]);
        const hoursThisMonth = hoursResult.length > 0 ? (hoursResult[0].total / 60) : 0;

        // 4. Active projects count
        const activeProjectsCount = await Project.countDocuments({ user_id: userId, status: 'ACTIVE' });

        // 5. Overdue invoices
        const overdueInvoices = await Invoice.find({ user_id: userId, status: 'OVERDUE' })
            .populate('client_id', 'name')
            .sort({ due_date: 1 });

        const formattedOverdue = overdueInvoices.map(i => ({
            ...i.toObject(),
            client_name: i.client_id?.name
        }));

        // 6. Upcoming deadlines (next 30 days)
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const upcomingProjects = await Project.find({
            user_id: userId,
            status: 'ACTIVE',
            deadline: { $gte: now, $lte: thirtyDaysFromNow }
        })
            .populate('client_id', 'name')
            .sort({ deadline: 1 })
            .limit(5);

        const formattedUpcoming = upcomingProjects.map(p => ({
            ...p.toObject(),
            client_name: p.client_id?.name
        }));

        res.json({
            stats: {
                total_clients: totalClientsCount,
                total_earnings: +totalEarnings.toFixed(2),
                outstanding_amount: +outstandingAmount.toFixed(2),
                hours_this_month: +hoursThisMonth.toFixed(1),
                active_projects: activeProjectsCount,
            },
            overdue_invoices: formattedOverdue,
            upcoming_deadlines: formattedUpcoming,
        });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/dashboard/activity ─────────────────────────────────────────────
router.get('/activity', async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Recent invoices
        const invoices = await Invoice.find({ user_id: userId })
            .populate('client_id', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        const recent_invoices = invoices.map(i => ({
            ...i.toObject(),
            client_name: i.client_id?.name
        }));

        // Recent time entries
        const entries = await TimeEntry.find({ user_id: userId })
            .populate('project_id', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        const recent_time_entries = entries.map(e => ({
            ...e.toObject(),
            project_name: e.project_id?.name
        }));

        res.json({
            recent_invoices,
            recent_time_entries
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
