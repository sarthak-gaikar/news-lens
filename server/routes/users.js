const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.put('/preferences', auth, userController.updatePreferences);
router.get('/history', auth, userController.getReadingHistory);
router.post('/interaction', auth, userController.trackInteraction);

module.exports = router;