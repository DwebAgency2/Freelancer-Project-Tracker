const app = require('../backend/server');

// Bridge entry for Vercel Serverless Functions
module.exports = async (req, res) => {
    try {
        return app(req, res);
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};
