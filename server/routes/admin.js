const express = require('express');
const settingsController = require('../controllers/settingsController');
const backupController = require('../controllers/backupController');
const activityController = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const upload = require('../config/upload');

const router = express.Router();

router.use(authenticate);

router.get('/settings', settingsController.getAll);
router.put('/settings', requireAdmin, settingsController.update);

router.get('/activity-logs', requireAdmin, activityController.getAll);

router.post('/backup', requireAdmin, backupController.createBackup);
router.get('/backup', requireAdmin, backupController.listBackups);
router.get('/backup/download/:filename', requireAdmin, backupController.downloadBackup);
router.post('/restore', requireAdmin, upload.single('sqlFile'), backupController.restoreBackup);

module.exports = router;
