const express = require('express');
const router = express.Router();
const pathController = require('../controllers/pathController');
const { verifyToken, restrictTo } = require('../middleware/auth');

router.get('/',      verifyToken, pathController.getAllPaths);
router.post('/',     verifyToken, restrictTo('Administrator'), pathController.createPath);
router.delete('/:id',verifyToken, restrictTo('Administrator'), pathController.deletePath);

module.exports = router;
