const newsService = require('../services/newsService');
const Article = require('../models/Article');
const User = require('../models/User'); // Add this import

const newsController = {
  async getNewsFeed(req, res) {
    try {
      const { 
        category = 'all', 
        bias = 'all', 
        source = 'all',
        page = 1, 
        limit = 20 
      } = req.query;

      const user = req.user;
      
      // Apply user preferences if available
      const filters = {
        category: category !== 'all' ? category : (user?.preferences?.topics || ['technology', 'politics']),
        bias: bias !== 'all' ? bias : 'all',
        source: source !== 'all' ? source : 'all',
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await newsService.getArticles(filters);

      res.json({
        success: true,
        data: result.articles,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalArticles: result.total
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  async refreshNews(req, res) {
    try {
      const categories = req.user?.preferences?.topics || ['technology', 'politics', 'business'];
      
      const articles = await newsService.fetchNewsFromAPI(categories, 30);

      res.json({
        success: true,
        message: `Refreshed ${articles.length} articles`,
        data: articles
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  async getArticle(req, res) {
    try {
      const { id } = req.params;

      const article = await Article.findById(id);
      if (!article) {
        return res.status(404).json({ 
          success: false,
          message: 'Article not found' 
        });
      }

      // Track reading history if user is authenticated
      if (req.user) {
        await User.findByIdAndUpdate(req.user._id, {
          $push: {
            readingHistory: {
              articleId: article._id,
              readAt: new Date(),
              interaction: 'read'
            }
          }
        });
      }

      res.json({
        success: true,
        data: article
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  async getCategories(req, res) {
    try {
      const categories = await Article.distinct('category');
      res.json({
        success: true,
        data: categories.filter(cat => cat) // Remove null values
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  async getSources(req, res) {
    try {
      const sources = await Article.distinct('source');
      res.json({
        success: true,
        data: sources.filter(source => source) // Remove null values
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // ADD THIS MISSING FUNCTION
  async getBiasStats(req, res) {
    try {
      const stats = await Article.aggregate([
        {
          $group: {
            _id: '$bias.label',
            count: { $sum: 1 }
          }
        }
      ]);

      // If no articles in database, return default stats
      if (stats.length === 0) {
        const defaultStats = [
          { _id: 'left', count: 0 },
          { _id: 'center', count: 0 },
          { _id: 'right', count: 0 },
          { _id: 'neutral', count: 0 }
        ];
        return res.json({
          success: true,
          data: defaultStats
        });
      }

      // Ensure all bias types are represented
      const biasTypes = ['left', 'center', 'right', 'neutral'];
      const completeStats = biasTypes.map(bias => {
        const existing = stats.find(stat => stat._id === bias);
        return existing || { _id: bias, count: 0 };
      });

      res.json({
        success: true,
        data: completeStats
      });
    } catch (error) {
      console.error('Get bias stats error:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
};

module.exports = newsController;