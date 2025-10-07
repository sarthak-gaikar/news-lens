const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const auth = require('../middleware/auth');

// Public routes
router.get('/categories', newsController.getCategories);
router.get('/sources', newsController.getSources);
router.get('/bias-stats', newsController.getBiasStats); // This line must be here

// Protected routes
router.get('/feed', auth, newsController.getNewsFeed);
router.get('/refresh', auth, newsController.refreshNews);
router.get('/article/:id', auth, newsController.getArticle);

module.exports = router;