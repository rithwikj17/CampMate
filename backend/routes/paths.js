const express = require('express');
const router = express.Router();
const pathController = require('../controllers/pathController');
const { verifyToken, restrictTo } = require('../middleware/auth');

router.get('/',      pathController.getAllPaths);
router.post('/',     pathController.createPath);
router.put('/:id',   pathController.updatePath);
router.delete('/:id', pathController.deletePath);

module.exports = router;
