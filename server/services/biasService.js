const natural = require('natural');
const { WordTokenizer, PorterStemmer, stopwords } = natural;

class BiasService {
  // In server/services/biasService.js

  constructor() {
    this.tokenizer = new WordTokenizer();
    this.stemmer = PorterStemmer;
    
    // 1. IMPROVEMENT: More keywords with nuanced weights (1-3).
    this.biasKeywords = {
      left: {
        'progressive': 2, 'social justice': 3, 'equity': 2, 'climate action': 2,
        'universal healthcare': 2, 'wealth tax': 3, 'green new deal': 3,
        'systemic': 3, 'privilege': 2, 'diversity': 1, 'inclusion': 1,
        'union': 1, 'worker rights': 2, 'medicare for all': 3, 'defund': 3,
        'reform': 1, 'biden': 1, 'democrat': 1, 'equality': 2, 'reproductive rights': 3,
        'collective': 2, 'corporate greed': 3, 'exploitation': 2,
        'big pharma': 2, 'inequality': 3, 'lgbtq+': 2, 'solidarity': 2, 'empowerment': 2,
        'obama': 1, 'clinton': 1
      },
      right: {
        'conservative': 2, 'free market': 2, 'tax cuts': 2, 'border security': 3,
        'second amendment': 3, 'pro-life': 3, 'traditional values': 2,
        'small government': 2, 'deregulation': 2, 'patriotism': 3, 'national security': 2,
        'fiscal responsibility': 2, 'states rights': 2, 'constitutional': 1, 'trump': 1,
        'republican': 1, 'liberty': 2, 'individualism': 2, 'freedom': 1,
        'socialism': 3, 'woke': 3, 'illegal': 2, 'elite': 2,
        'globalism': 2, 'unconstitutional': 2, 'heritage': 2, 'pro-growth': 2,
        'big government': 3, 'freedom of speech': 2
      },
      neutral: [
        'report', 'study', 'research', 'data', 'according to', 'analysis',
        'findings', 'survey', 'results', 'evidence', 'statistics',
        'expert', 'official', 'says', 'states', 'announced', 'spokesperson'
      ]
    };

    // --- The rest of the constructor remains the same ---

    // Pre-stem the keywords for efficient matching
    this.stemmedKeywords = {
      left: {},
      right: {},
      neutral: this.biasKeywords.neutral.map(w => this.stemmer.stem(w.toLowerCase()))
    };

    // 2. IMPROVEMENT: Stem keywords from the weighted object keys
    Object.keys(this.biasKeywords.left).forEach(word => {
      const stemmedWord = word.split(' ').map(w => this.stemmer.stem(w.toLowerCase())).join(' ');
      this.stemmedKeywords.left[stemmedWord] = this.biasKeywords.left[word]; // Store the weight
    });

    Object.keys(this.biasKeywords.right).forEach(word => {
      const stemmedWord = word.split(' ').map(w => this.stemmer.stem(w.toLowerCase())).join(' ');
      this.stemmedKeywords.right[stemmedWord] = this.biasKeywords.right[word]; // Store the weight
    });

    // Create a set of common stop words to ignore
    this.stopWords = new Set(stopwords);
  }

  /**
  * Analyzes the bias of a single article.
  * @param {object} article - The article object with title, description, and content.
  * @returns {object} A detailed bias analysis object.
  */
  async analyzeArticle(article) {
    const text = `${article.title || ''} ${article.description || ''} ${article.content || ''}`.toLowerCase();
    
    const tokens = this.tokenizer.tokenize(text);
    if (!tokens || tokens.length === 0) {
      return { score: 0, label: 'center', confidence: 0, matchedKeywords: [] };
    }

    const tokenMap = {};
    const stemmedTokens = tokens.map(token => {
      const stemmed = this.stemmer.stem(token);
      if (!this.stopWords.has(token) && token.length > 2) {
        tokenMap[stemmed] = token; 
      }
      return stemmed;
    });

    let scores = { left: 0, right: 0, neutral: 0 };
    let matchedKeywords = [];

    for (const stemmedToken of stemmedTokens) {
      if (this.stemmedKeywords.left[stemmedToken]) {
        scores.left += this.stemmedKeywords.left[stemmedToken]; 
        matchedKeywords.push(tokenMap[stemmedToken]); 
      } else if (this.stemmedKeywords.right[stemmedToken]) {
        scores.right += this.stemmedKeywords.right[stemmedToken]; 
        matchedKeywords.push(tokenMap[stemmedToken]); 
      } else if (this.stemmedKeywords.neutral.includes(stemmedToken)) {
        scores.neutral++;
      }
    }
    
    const totalBiasMatches = scores.left + scores.right;
    
    let biasScore = 0;
    if (totalBiasMatches > 0) {
      biasScore = (scores.right - scores.left) / totalBiasMatches;
    }

    let biasLabel = 'center';
    let confidence = 0;

    if (totalBiasMatches < 3) {
      biasLabel = 'center';
      confidence = (totalBiasMatches / 3) * 0.5;
    } else if (biasScore < -0.6) {
      biasLabel = 'left';
      confidence = Math.abs(biasScore);
    } else if (biasScore < -0.15) {
      biasLabel = 'leaning-left';
      confidence = Math.abs(biasScore);
    } else if (biasScore > 0.6) {
      biasLabel = 'right';
      confidence = Math.abs(biasScore);
    } else if (biasScore > 0.15) {
      biasLabel = 'leaning-right';
      confidence = Math.abs(biasScore);
    } else {
      biasLabel = 'center';
      confidence = 1.0 - (Math.abs(biasScore) / 0.15);
    }
    
    if (biasLabel === 'center' && scores.neutral > (scores.left + scores.right)) {
      biasLabel = 'neutral';
      confidence = Math.min(1, scores.neutral / (totalBiasMatches + 1));
    }

    // --- THIS IS THE CORRECTED MAPPING LOGIC ---
    // It maps our detailed labels to the simple *values* your frontend uses.
    let dbLabel = 'center'; // Default
    switch (biasLabel) {
      case 'left':
      case 'leaning-left':
        dbLabel = 'left'; // Matches frontend value: 'left'
        break;
      case 'right':
      case 'leaning-right':
        dbLabel = 'right'; // Matches frontend value: 'right'
        break;
      case 'center':
        dbLabel = 'center'; // Matches frontend value: 'center'
        break;
      case 'neutral':
        dbLabel = 'neutral'; // Matches frontend value: 'neutral'
        break;
    }
    // --- END OF FIX ---

    const uniqueKeywords = [...new Set(matchedKeywords)];

    return {
      score: parseFloat(biasScore.toFixed(2)),
      label: dbLabel, // <-- FIX: We now return the correct value ('left', 'center', etc.)
      confidence: parseFloat(Math.min(1, confidence).toFixed(2)),
      matchedKeywords: uniqueKeywords.slice(0, 5) 
    };
  }
}

module.exports = new BiasService();