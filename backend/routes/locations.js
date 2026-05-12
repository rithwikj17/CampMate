const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { verifyToken, restrictTo } = require('../middleware/auth');

// Public (authenticated users)
router.get('/', locationController.getAllLocations);

// Admin only
router.post('/',      locationController.createLocation);
router.put('/:id',    locationController.updateLocation);
router.delete('/:id', locationController.deleteLocation);

module.exports = router;
