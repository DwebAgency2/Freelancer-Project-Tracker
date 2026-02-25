const app = require('../backend/server');

// Bridge entry for Vercel Serverless Functions
module.exports = async (req, res) => {
    const timestamp = new Date().toISOString();
    try {
        console.log(`[${timestamp}] 📬 Bridge received: ${req.method} ${req.url}`);

        // Pass to Express
        return app(req, res);
    } catch (error) {
        console.error(`[${timestamp}] ❌ Bridge Crash:`, error);
        if (!res.headersSent) {
            res.status(500).json({
                message: 'Internal Server Error (Vercel Bridge)',
                error: error.message
            });
        }
    }
};
