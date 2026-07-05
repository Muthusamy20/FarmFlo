const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/types', reportController.getTypes);
router.get('/:type', reportController.generate);

module.exports = router;
