const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Map the errors into a cleaner array
        const extractedErrors = errors.array().map(err => ({ [err.path]: err.msg }));
        return sendError(res, 400, 'Validation Failed', extractedErrors);
    }
    next();
};

module.exports = { validate };
