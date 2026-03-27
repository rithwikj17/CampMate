const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const userController = require('../controllers/userController');

// All routes require authentication
router.use(verifyToken);

router.get('/me', userController.getMe);

router.patch('/me', [
    body('bio').optional().isString().trim(),
    body('profile_picture_url').optional().isURL().withMessage('Must be a valid URL')
], validate, userController.updateMe);

router.get('/me/events', userController.getMyEvents);

module.exports = router;
