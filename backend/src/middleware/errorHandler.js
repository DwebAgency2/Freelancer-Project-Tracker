/**
 * Global error handling middleware.
 * Must be registered LAST in Express app (after all routes).
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        const messages = err.errors.map((e) => e.message);
        return res.status(400).json({ message: 'Validation error', errors: messages });
    }

    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0]?.path || 'field';
        return res.status(409).json({ message: `${field} already exists.` });
    }

    // Default to 500
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
