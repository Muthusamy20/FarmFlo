const express = require('express');
const searchController = require('../controllers/searchController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);
router.get('/', searchController.globalSearch);

module.exports = router;
