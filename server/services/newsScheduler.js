const newsService = require('./newsService');
const Article = require('../models/Article');

class NewsScheduler {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) {
      console.log('🔄 News scheduler is already running');
      return;
    }

    console.log('🚀 Starting news scheduler...');
    this.isRunning = true;

    // Initial fetch
    this.fetchAllCategories();

    // Schedule periodic fetching every 10 minutes
    this.intervalId = setInterval(() => {
      this.fetchAllCategories();
    }, 10 * 60 * 1000); // 10 minutes in milliseconds

    console.log('✅ News scheduler started - fetching every 10 minutes');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 News scheduler stopped');
  }

  async fetchAllCategories() {
    try {
      console.log('📡 Scheduled news fetch started...');
      
      const categories = [
        'technology', 'politics', 'business', 
        'entertainment', 'sports', 'health', 'science'
      ];

      let totalFetched = 0;

      // Fetch news for each category
      for (const category of categories) {
        try {
          console.log(`📰 Fetching ${category} news...`);
          const articles = await newsService.fetchNewsFromAPI([category], 10);
          totalFetched += articles.length;
          console.log(`✅ Fetched ${articles.length} ${category} articles`);
          
          // Small delay between categories to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Error fetching ${category} news:`, error.message);
        }
      }

      // Get total articles count
      const totalArticles = await Article.countDocuments();
      
      console.log(`🎉 Scheduled fetch completed!`);
      console.log(`📊 Total articles in database: ${totalArticles}`);
      console.log(`⏰ Next fetch in 10 minutes...`);

      return totalFetched;
    } catch (error) {
      console.error('❌ Scheduled news fetch failed:', error.message);
    }
  }

  // Manual trigger for testing
  async manualFetch() {
    console.log('🔧 Manual news fetch triggered');
    return await this.fetchAllCategories();
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      nextFetch: this.intervalId ? 'Every 10 minutes' : 'Not scheduled'
    };
  }
}

module.exports = new NewsScheduler();