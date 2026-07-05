const express = require('express');
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);
router.get('/insights', aiController.getInsights);

module.exports = router;
