const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { verifyToken, restrictTo } = require('../middleware/auth');
const clubController = require('../controllers/clubController');

// Get all clubs
router.get('/', clubController.getAllClubs);

// Get single club details
router.get('/:id', [
    param('id').isInt().withMessage('Valid club ID required')
], validate, clubController.getClubById);

// Get all events for a specific club (public)
router.get('/:id/events', [
    param('id').isInt().withMessage('Valid club ID required')
], validate, clubController.getClubEvents);

// Join club
router.post('/:id/join', verifyToken, [
    param('id').isInt().withMessage('Valid club ID required')
], validate, clubController.joinClub);

// Leave club
router.delete('/:id/leave', verifyToken, [
    param('id').isInt().withMessage('Valid club ID required')
], validate, clubController.leaveClub);

// Get club members (Admin only)
router.get('/:id/members', verifyToken, [
    param('id').isInt().withMessage('Valid club ID required')
], validate, clubController.getClubMembers);

// Create announcement (Club Admin only)
router.post('/:id/announcements', verifyToken, [
    param('id').isInt().withMessage('Valid club ID required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('body').notEmpty().withMessage('Body text is required')
], validate, clubController.createAnnouncement);

module.exports = router;
