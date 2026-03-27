const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { verifyToken, restrictTo } = require('../middleware/auth');
const eventController = require('../controllers/eventController');

// Get all events
router.get('/', [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('upcoming').optional().isBoolean(),
    query('category').optional().isString()
], validate, eventController.getAllEvents);

// Create event
router.post('/', verifyToken, restrictTo('Administrator', 'Club Member'), [
    body('title').notEmpty().withMessage('Title is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('venue').notEmpty().withMessage('Venue is required'),
    body('organizer_id').isInt().withMessage('Valid organizer ID required'),
    body('max_participants').optional().isInt({ min: 1 }).toInt()
], validate, eventController.createEvent);

// Register for event
router.post('/:id/register', verifyToken, [
    param('id').isInt().withMessage('Valid event ID required')
], validate, eventController.registerEvent);

// Unregister from event
router.delete('/:id/unregister', verifyToken, [
    param('id').isInt().withMessage('Valid event ID required')
], validate, eventController.unregisterEvent);

// Delete event (Soft delete)
router.delete('/:id', verifyToken, restrictTo('Administrator'), [
    param('id').isInt().withMessage('Valid event ID required')
], validate, eventController.deleteEvent);

module.exports = router;
