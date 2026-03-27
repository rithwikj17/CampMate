const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

const verifyToken = (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken; // Support cookie-based fallback
  }

  if (!token) {
    return sendError(res, 401, 'Access denied. No token provided.');
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_campmate');
    req.user = verified;
    next();
  } catch (err) {
    return sendError(res, 401, 'Invalid or expired token.');
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, 'Forbidden. You do not have permission to perform this action.');
    }
    next();
  };
};

module.exports = { verifyToken, restrictTo };
