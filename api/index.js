const app = require('../backend/server');

// Bridge entry for Vercel Serverless Functions
module.exports = (req, res) => {
    // Add bridge-level logging
    console.log(`[Bridge] ${req.method} ${req.url}`);
    return app(req, res);
};
