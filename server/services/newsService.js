const axios = require('axios');
const Article = require('../models/Article');
const biasService = require('./biasService');

class NewsService {
  constructor() {
    this.apiKey = process.env.NEWS_API_KEY;
    this.baseURL = 'https://newsapi.org/v2';
  }

  async fetchNewsFromAPI(categories = ['general'], pageSize = 30) {
    try {
      console.log('📡 Fetching news from NewsAPI...');
      
      // If no API key, return sample data
      if (!this.apiKey || this.apiKey === 'your_newsapi_key_here') {
        console.log('⚠️  Using sample data - Add NEWS_API_KEY to .env');
        return this.getSampleArticles();
      }

      const requests = categories.map(category => 
        axios.get(`${this.baseURL}/top-headlines`, {
          params: {
            category,
            pageSize: Math.ceil(pageSize / categories.length),
            country: 'us',
            apiKey: this.apiKey
          }
        })
      );

      const responses = await Promise.all(requests);
      let articles = [];
      
      responses.forEach(response => {
        if (response.data.articles) {
          articles = [...articles, ...response.data.articles];
        }
      });

      console.log(`✅ Fetched ${articles.length} articles from NewsAPI`);
      
      // Process and save articles
      const processedArticles = await Promise.all(
        articles.map(article => this.processAndSaveArticle(article))
      );

      return processedArticles.filter(article => article !== null);
    } catch (error) {
      console.error('❌ NewsAPI Error:', error.message);
      // Return sample data if API fails
      return this.getSampleArticles();
    }
  }

  async processAndSaveArticle(articleData) {
    try {
      // Check if article already exists
      const existingArticle = await Article.findOne({ url: articleData.url });
      if (existingArticle) {
        return existingArticle;
      }

      // Analyze bias
      const biasAnalysis = await biasService.analyzeArticle(articleData);

      // Create new article
      const article = new Article({
        title: articleData.title,
        description: articleData.description,
        content: articleData.content,
        source: articleData.source?.name || 'Unknown',
        url: articleData.url,
        imageUrl: articleData.urlToImage,
        publishedAt: new Date(articleData.publishedAt),
        category: this.categorizeArticle(articleData),
        bias: biasAnalysis
      });

      await article.save();
      return article;
    } catch (error) {
      console.error('Error processing article:', error.message);
      return null;
    }
  }

  categorizeArticle(article) {
    const title = (article.title || '').toLowerCase();
    if (title.includes('tech') || title.includes('ai') || title.includes('software')) return 'technology';
    if (title.includes('politic') || title.includes('election') || title.includes('government')) return 'politics';
    if (title.includes('busi') || title.includes('economy') || title.includes('market')) return 'business';
    if (title.includes('health') || title.includes('medical') || title.includes('covid')) return 'health';
    if (title.includes('sport') || title.includes('game') || title.includes('match')) return 'sports';
    return 'general';
  }

  getSampleArticles() {
    // Return sample articles for development
    return [
      {
        _id: '1',
        title: "New Climate Bill Passes Senate with Bipartisan Support",
        description: "The landmark legislation aims to reduce carbon emissions by 50% by 2030 through investments in renewable energy.",
        source: "Reuters",
        url: "https://example.com/article1",
        imageUrl: "https://images.unsplash.com/photo-1569163139394-de44cb2c8cb7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        publishedAt: new Date(),
        category: "politics",
        bias: { score: 0.1, label: "neutral", confidence: 0.8, keywords: ["bipartisan", "legislation"] }
      },
      {
        _id: '2',
        title: "Tech Giant Unveils Revolutionary AI Assistant",
        description: "The new AI system can understand complex queries with unprecedented accuracy, raising ethical concerns.",
        source: "TechNews Daily",
        url: "https://example.com/article2",
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        publishedAt: new Date(),
        category: "technology",
        bias: { score: 0.0, label: "center", confidence: 0.7, keywords: ["revolutionary", "ethical"] }
      },
      {
        _id: '3',
        title: "Federal Reserve Announces Interest Rate Hike to Combat Inflation",
        description: "The central bank raised rates by 0.75 percentage points, the largest increase in decades.",
        source: "Wall Street Journal",
        url: "https://example.com/article3",
        imageUrl: "https://images.unsplash.com/photo-1591696205602-2f950c417dad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        publishedAt: new Date(),
        category: "business",
        bias: { score: -0.3, label: "right", confidence: 0.6, keywords: ["combat", "inflation"] }
      },
      {
        _id: '4',
        title: "Study Finds Mediterranean Diet Reduces Heart Disease Risk by 30%",
        description: "New research confirms that a diet rich in fruits and healthy fats improves cardiovascular health.",
        source: "Health Today",
        url: "https://example.com/article4",
        imageUrl: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        publishedAt: new Date(),
        category: "health",
        bias: { score: 0.0, label: "neutral", confidence: 0.9, keywords: ["study", "research"] }
      }
    ];
  }

  async getArticles(filters = {}) {
    const { category, bias, source, page = 1, limit = 20 } = filters;
    
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
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
      .skip((page - 1) * limit);

    const total = await Article.countDocuments(query);

    return {
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };
  }
}

module.exports = new NewsService();