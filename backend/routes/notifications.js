const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// All endpoints require authentication
router.use(verifyToken);

// Get my notifications
router.get('/', notificationController.getMyNotifications);

// Mark notification as read
router.patch('/:id/read', [
    param('id').isInt().withMessage('Valid notification ID required')
], validate, notificationController.markAsRead);

module.exports = router;
