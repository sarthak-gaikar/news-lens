const newsService = require('../services/newsService');
const newsScheduler = require('../services/newsScheduler');
const Article = require('../models/Article');
const User = require('../models/User');

const newsController = {
  /**
  * Gets a public, non-personalized feed for the homepage.
  */
  async getPublicNewsFeed(req, res) {
    try {
      // --- FIX: Changed default limit from 10 to 3 ---
      const { limit = 3 } = req.query;

      const filters = {
        category: 'all',
        bias: 'all',
        page: 1,
        limit: parseInt(limit)
      };

      // Call the existing service, but with generic filters
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
      console.error('Get Public News Feed Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * --- NEW FUNCTION ---
   * Gets a public preview feed for the main /news page (logged-out).
   * Fetches the 3 most recent articles from *each* category.
   */
  async getPublicPreviewFeed(req, res) {
    try {
      const articles = await Article.aggregate([
        // 1. Sort all articles by date, newest first
        { $sort: { publishedAt: -1 } },
        
        // 2. Group them by category
        {
          $group: {
            _id: '$category',
            articles: { $push: '$$ROOT' } // Push the full article object
          }
        },
        
        // 3. For each category, get only the first 3 articles
        {
          $project: {
            _id: 0,
            category: '$_id',
            latestArticles: { $slice: ['$articles', 3] }
          }
        },
        
        // 4. Unwind the arrays of 3 articles
        { $unwind: '$latestArticles' },
        
        // 5. Make the article object the root of the document
        { $replaceRoot: { newRoot: '$latestArticles' } },
        
        // 6. Sort the final combined list by date again
        { $sort: { publishedAt: -1 } }
      ]);

      // Note: We don't send pagination data for this view
      res.json({ success: true, data: articles });

    } catch (error) {
      console.error('Get Public Preview Feed Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
  * Gets the news feed for a user, applying their preferences.
  */
  async getNewsFeed(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20,
        category = 'all', 
        bias = 'all' 
      } = req.query;

      const user = req.user;
      
      const categoryFilter = category !== 'all' 
        ? [category] 
        : (user?.preferences?.topics?.length ? user.preferences.topics : ['technology', 'politics', 'business', 'health']);

      const filters = {
        category: categoryFilter,
        bias: bias,
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
      console.error('Get News Feed Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
  * Manually triggers a news fetch and returns the user's updated feed.
  */
  async refreshNews(req, res) {
    try {
      console.log('🔧 Manual news refresh request received.');
      
      await newsScheduler.manualFetch();
      
      console.log('✅ Database updated. Sending fresh feed to the client.');
      return await newsController.getNewsFeed(req, res);

    } catch (error) {
      console.error('❌ Error during manual refresh:', error.message);
      res.status(500).json({ 
        success: false,
        message: 'Failed to refresh the news feed.' 
      });
    }
  },

  /**
  * Gets a single article by its ID.
  */
  async getArticle(req, res) {
    try {
      const { id } = req.params;
      const article = await Article.findById(id);

      if (!article) {
        return res.status(404).json({ success: false, message: 'Article not found' });
      }
      
      res.json({ success: true, data: article });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
  * Gets a list of all *possible* categories from the Article model's enum.
  */
  async getCategories(req, res) {
    try {
      const categories = Article.schema.path('category').enumValues;
      res.json({ success: true, data: categories.filter(cat => cat) });
    } catch (error) {
      console.error('Get Categories Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
  * Gets a list of all unique sources in the database.
  */
  async getSources(req, res) {
    try {
      const sources = await Article.distinct('source');
      res.json({ success: true, data: sources.filter(source => source) });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
    * Gets the count of articles for each bias label.
    */
  async getBiasStats(req, res) {
    try {
      const stats = await Article.aggregate([
        {
          $group: {
            _id: '$bias.label', // Group by the bias label
            count: { $sum: 1 }    // Count the articles in each group
          }
        },
        {
          $project: {
            _id: 0,
            label: '$_id', // Rename _id to 'label'
            count: '$count'
          }
        },
        {
          $sort: { label: 1 } // Sort alphabetically
        }
      ]);

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Get Bias Stats Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = newsController;