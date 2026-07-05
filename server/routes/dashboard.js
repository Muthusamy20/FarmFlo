const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/summary', dashboardController.getSummary);
router.get('/charts', dashboardController.getCharts);
router.get('/activities', dashboardController.getRecentActivities);
router.get('/calendar', dashboardController.getCalendarEvents);

module.exports = router;
