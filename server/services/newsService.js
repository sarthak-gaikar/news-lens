const axios = require('axios');
const Article = require('../models/Article');
const biasService = require('./biasService');

class NewsService {
  constructor() {
    this.apiKey = process.env.NEWS_API_KEY;
    this.baseURL = 'https://newsapi.org/v2';
  }

  /**
  * Fetches news from the NewsAPI for a given set of categories.
  * @param {string[]} categories - Array of categories to fetch.
  * @param {number} pageSize - Total number of articles to fetch across all categories.
  * @returns {Promise<Array>} A promise that resolves to an array of processed articles.
  */
  async fetchNewsFromAPI(categories = ['general'], pageSize = 30) {
    try {
      console.log('📡 Fetching news from NewsAPI...');
      
      if (!this.apiKey || this.apiKey === 'your_newsapi_key_here') {
        console.log('⚠️  Using sample data - Add NEWS_API_KEY to .env');
        return this.getSampleArticles();
      }

      const articlesPerCategory = Math.ceil(pageSize / categories.length);

      // 1. Create all requests
      const requests = categories.map(category => 
        axios.get(`${this.baseURL}/top-headlines`, {
          params: {
            category,
            pageSize: articlesPerCategory,
            country: 'us',
            apiKey: this.apiKey
          }
        }).then(response => ({ // 2. Tag response data with its category
          category,
          articles: response.data.articles || [] 
        }))
        .catch(err => {
          console.error(`Error fetching category ${category}:`, err.message);
          return { category, articles: [] }; // Don't let one category fail all
        })
      );

      const responses = await Promise.all(requests);

      // 3. Flatten into one list, but keep category tag
      const articlesWithCategory = responses.flatMap(response => 
        response.articles.map(article => ({
          articleData: article,
          category: response.category
        }))
      );
      
      console.log(`✅ Fetched ${articlesWithCategory.length} total articles from NewsAPI`);
      
      // 4. Process with the correct, specific category
      const processedArticles = await Promise.all(
        articlesWithCategory.map(item => 
          this.processAndSaveArticle(item.articleData, item.category) 
        )
      );

      // Filter out any articles that failed processing or already existed.
      return processedArticles.filter(article => article !== null);
    } catch (error) {
      console.error('❌ NewsAPI Error:', error.response ? error.response.data : error.message);
      return this.getSampleArticles();
    }
  }

  /**
  * Processes a single article, analyzes its bias, and saves it to the database if it's new.
  * @param {object} articleData - The raw article data from the API.
  * @param {string} category - The specific category this article was fetched for.
  * @returns {Promise<object|null>} The saved article document or null if processing fails.
  */
  async processAndSaveArticle(articleData, category) {
    try {
      const existingArticle = await Article.findOne({ url: articleData.url });
      if (existingArticle) {
        return null; // Don't re-process existing articles.
      }

      const biasAnalysis = await biasService.analyzeArticle(articleData);

      const article = new Article({
        title: articleData.title,
        description: articleData.description,
        content: articleData.content,
        source: articleData.source?.name || 'Unknown',
        url: articleData.url,
        imageUrl: articleData.urlToImage,
        publishedAt: new Date(articleData.publishedAt),
        category: this.categorizeArticle(articleData, category), 
        
        // --- THIS IS THE FIX ---
        // Map the analysis object to your schema fields
        bias: {
          score: biasAnalysis.score,
          label: biasAnalysis.label,
          confidence: biasAnalysis.confidence,
          keywords: biasAnalysis.matchedKeywords // Map matchedKeywords to keywords
        }
        // --- END OF FIX ---
      });

      await article.save();
      return article;
    } catch (error) {
      console.error(`Error processing article "${articleData.title}":`, error.message);
      return null;
    }
  }

  // In server/services/newsService.js

  // In server/services/newsService.js

  /**
  * Determines the category of an article based on its title and the fetch context.
  * @param {object} article - The article data.
  * @param {string} category - The category context from the API call (e.g., 'technology').
  * @returns {string} The determined category.
  */
  categorizeArticle(article, category) {
    
    // 1. Trust the category from the API call first.
    if (category && category !== 'general') {
      return category;
    }

    // 2. Fallback to keyword analysis ONLY if the category was 'general'
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    
    // Combine text for better matching
    const fullText = title + ' ' + description; 

    // --- IMPROVED KEYWORD LISTS ---
    if (fullText.includes('tech') || fullText.includes('ai') || fullText.includes('software') || fullText.includes('apple') || fullText.includes('google') || fullText.includes('microsoft') || fullText.includes('startup') || fullText.includes('crypto')) return 'technology';
    if (fullText.includes('politic') || fullText.includes('election') || fullText.includes('congress') || fullText.includes('white house') || fullText.includes('senate') || fullText.includes('democrat') || fullText.includes('republican')) return 'politics';
    if (fullText.includes('business') || fullText.includes('economy') || fullText.includes('stocks') || fullText.includes('market') || fullText.includes('finance') || fullText.includes('corporate') || fullText.includes('wall street')) return 'business';
    if (fullText.includes('health') || fullText.includes('medical') || fullText.includes('fda') || fullText.includes('covid') || fullText.includes('disease') || fullText.includes('hospital') || fullText.includes('pandemic')) return 'health';
    if (fullText.includes('sport') || fullText.includes('nfl') || fullText.includes('nba') || fullText.includes('olympic') || fullText.includes('soccer') || fullText.includes('ufc') || fullText.includes('mma') || fullText.includes('game') || fullText.includes('league')) return 'sports';
    if (fullText.includes('entertainment') || fullText.includes('movie') || fullText.includes('music') || fullText.includes('hollywood') || fullText.includes('celebrity') || fullText.includes('film') || fullText.includes('grammy')) return 'entertainment';
    if (fullText.includes('science') || fullText.includes('nasa') || fullText.includes('space') || fullText.includes('climate') || fullText.includes('planet') || fullText.includes('research') || fullText.includes('discovery')) return 'science';

    // 3. If still no match, return 'general'
    return 'general';
  }

  /**
  * Retrieves articles from the database based on specified filters.
  * @param {object} filters - Filtering and pagination options.
  * @returns {Promise<object>} An object containing articles and pagination info.
  */
  async getArticles(filters = {}) {
    const { category, bias, source, page = 1, limit = 20 } = filters;
    let query = {};
    
    if (category && category !== 'all' && Array.isArray(category) && category.length > 0) {
        query.category = { $in: category };
    }
    
    if (bias && bias !== 'all') {
      query['bias.label'] = bias;
    }
    
    if (source && source !== 'all') {
      query.source = new RegExp(source, 'i');
    }

    const articles = await Article.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean(); 

    const total = await Article.countDocuments(query);

    return {
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };
  }

  /**
  * Provides sample articles for development when the NewsAPI key is missing.
  * @returns {Array} An array of sample article objects.
  */
  getSampleArticles() {
    return [
        { _id: '1', title: "Sample: Climate Bill Passes Senate", description: "A landmark bill passes.", source: "Reuters", url: "#", publishedAt: new Date(), category: "politics", bias: { score: 0.1, label: "neutral" }},
        { _id: '2', title: "Sample: Tech Giant Unveils New AI", description: "The new AI system is here.", source: "TechNews", url: "#", publishedAt: new Date(), category: "technology", bias: { score: 0.0, label: "center" }}
    ];
  }
}

module.exports = new NewsService();