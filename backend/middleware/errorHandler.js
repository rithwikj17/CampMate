const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
    console.error('Global Error Handler:', err.message, err.stack);

    // If it's a known error shape or trusted custom error, map it
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal Server Error';

    return sendError(res, statusCode, message);
};

module.exports = errorHandler;
