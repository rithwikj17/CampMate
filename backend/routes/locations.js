const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Get all locations for the map
router.get('/', locationController.getAllLocations);

module.exports = router;
