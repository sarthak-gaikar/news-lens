const express = require('express');
const router = express.Router();
const schedulerController = require('../controllers/schedulerController');
const auth = require('../middleware/auth');

// Public routes
router.get('/status', schedulerController.getStatus); // Remove auth middleware

// Protected routes for scheduler control
router.post('/start', auth, schedulerController.startScheduler);
router.post('/stop', auth, schedulerController.stopScheduler);
router.post('/fetch-now', auth, schedulerController.manualFetch);

module.exports = router;