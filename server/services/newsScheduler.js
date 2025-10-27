const newsService = require('./newsService');
const Article = require('../models/Article');

class NewsScheduler {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  /**
   * Starts the automatic news fetching schedule.
   */
  start() {
    if (this.isRunning) {
      console.log('🔄 News scheduler is already running.');
      return;
    }

    console.log('🚀 Starting news scheduler...');
    this.isRunning = true;

    // Perform an initial fetch immediately on start.
    this.fetchAllCategories();

    // Schedule periodic fetching every 3 minutes.
    this.intervalId = setInterval(() => {
      this.fetchAllCategories();
    }, 3 * 60 * 1000); // 3 minutes in milliseconds

    console.log('✅ News scheduler started - fetching every 3 minutes.');
  }

  /**
   * Stops the automatic news fetching schedule.
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 News scheduler stopped.');
  }

  /**
   * Fetches news for all predefined categories.
   */
  async fetchAllCategories() {
    console.log('📡 Scheduled news fetch triggered...');
    
    const categories = [
      'technology', 'politics', 'business', 
      'entertainment', 'sports', 'health', 'science'
    ];

    try {
      // This single call fetches and processes articles for all categories in parallel.
      const newArticles = await newsService.fetchNewsFromAPI(categories, 70); // Fetch ~10 per category
      
      const totalArticles = await Article.countDocuments();
      
      console.log(`🎉 Scheduled fetch completed! Added ${newArticles.length} new articles.`);
      console.log(`📊 Total articles in database: ${totalArticles}`);
      console.log(`⏰ Next fetch in 3 minutes...`);
    } catch (error) {
      console.error('❌ Scheduled news fetch failed:', error.message);
    }
  }

  /**
   * Manually triggers a news fetch cycle.
   * @returns {Promise} A promise that resolves when the fetch is complete.
   */
  async manualFetch() {
    console.log('🔧 Manual news fetch triggered by an API call.');
    return await this.fetchAllCategories();
  }
}

module.exports = new NewsScheduler();