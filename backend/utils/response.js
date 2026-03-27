/**
 * Standardized Response Formatter
 * { success: bool, data: any, message: string, pagination?: object }
 */

const sendResponse = (res, statusCode, message, data = null, pagination = null) => {
    const payload = {
        success: statusCode >= 200 && statusCode < 300,
        message,
    };

    if (data !== null) {
        payload.data = data;
    }

    if (pagination) {
        payload.pagination = pagination;
    }

    return res.status(statusCode).json(payload);
};

// Helpers
const sendSuccess = (res, message, data = null, pagination = null) => {
    return sendResponse(res, 200, message, data, pagination);
};

const sendCreated = (res, message, data = null) => {
    return sendResponse(res, 201, message, data);
};

const sendError = (res, statusCode, message, errors = null) => {
    const payload = {
        success: false,
        message,
    };
    if (errors) {
        payload.errors = errors; // Useful for passing express-validator error arrays
    }
    return res.status(statusCode).json(payload);
};

module.exports = {
    sendResponse,
    sendSuccess,
    sendCreated,
    sendError
};
