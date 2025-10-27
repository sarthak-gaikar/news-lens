const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// --- ADD THESE NEW ROUTES ---
router.post('/toggle-interaction', auth, userController.toggleInteraction);
router.get('/stats', auth, userController.getUserStats);

// --- Existing routes ---
router.put('/preferences', auth, userController.updatePreferences);
router.get('/history', auth, userController.getReadingHistory);
router.post('/interaction', auth, userController.trackInteraction);

module.exports = router;