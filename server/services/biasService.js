const natural = require('natural');
const { WordTokenizer, PorterStemmer } = natural;

class BiasService {
  constructor() {
    this.tokenizer = new WordTokenizer();
    this.stemmer = PorterStemmer;
    
    // Simple keyword-based bias detection
    this.biasKeywords = {
      left: [
        'progressive', 'social justice', 'equity', 'climate action', 'universal healthcare',
        'wealth tax', 'green new deal', 'systemic', 'privilege', 'diversity', 'inclusion',
        'union', 'worker rights', 'medicare for all', 'defund', 'reform'
      ],
      right: [
        'conservative', 'free market', 'tax cuts', 'border security', 'second amendment',
        'pro-life', 'traditional values', 'small government', 'deregulation', 'patriotism',
        'national security', 'fiscal responsibility', 'states rights', 'constitutional'
      ],
      neutral: [
        'report', 'study', 'research', 'data', 'according to', 'analysis', 'findings',
        'survey', 'results', 'evidence', 'statistics'
      ]
    };

    // Pre-stem keywords for better matching
    this.stemmedKeywords = {};
    Object.keys(this.biasKeywords).forEach(bias => {
      this.stemmedKeywords[bias] = this.biasKeywords[bias].map(word => 
        this.stemmer.stem(word.toLowerCase())
      );
    });
  }

  async analyzeArticle(article) {
    const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
    const tokens = this.tokenizer.tokenize(text);
    const stemmedTokens = tokens.map(token => this.stemmer.stem(token));

    let scores = { left: 0, right: 0, neutral: 0 };
    let totalMatches = 0;

    // Count keyword matches
    Object.keys(this.stemmedKeywords).forEach(bias => {
      this.stemmedKeywords[bias].forEach(keyword => {
        if (stemmedTokens.includes(keyword)) {
          scores[bias]++;
          totalMatches++;
        }
      });
    });

    // Calculate bias score (-1 to 1, where -1 = left, 1 = right)
    let biasScore = 0;
    if (totalMatches > 0) {
      biasScore = (scores.right - scores.left) / totalMatches;
    }

    // Determine bias label
    let biasLabel = 'neutral';
    let confidence = Math.abs(biasScore);

    if (biasScore < -0.2) {
      biasLabel = 'left';
    } else if (biasScore > 0.2) {
      biasLabel = 'right';
    } else if (Math.abs(biasScore) < 0.1 && scores.neutral > 0) {
      biasLabel = 'neutral';
    } else {
      biasLabel = 'center';
    }

    // Extract significant keywords
    const keywords = this.extractSignificantKeywords(stemmedTokens);

    return {
      score: parseFloat(biasScore.toFixed(2)),
      label: biasLabel,
      confidence: parseFloat(confidence.toFixed(2)),
      keywords: keywords.slice(0, 5) // Top 5 keywords
    };
  }

  extractSignificantKeywords(tokens) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const frequency = {};

    tokens.forEach(token => {
      if (!stopWords.has(token) && token.length > 3) {
        frequency[token] = (frequency[token] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  async compareArticles(articles) {
    // Simple comparison of multiple articles on same topic
    const analyses = await Promise.all(
      articles.map(article => this.analyzeArticle(article))
    );

    return analyses.map((analysis, index) => ({
      source: articles[index].source,
      title: articles[index].title,
      bias: analysis
    }));
  }
}

module.exports = new BiasService();