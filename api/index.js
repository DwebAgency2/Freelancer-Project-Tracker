const app = require('../backend/server');

// This bridge allows Vercel to see the backend as a standard serverless function
// while keeping all your backend code in the "backend" folder.

module.exports = app;
