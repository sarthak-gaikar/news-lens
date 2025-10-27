import React from 'react';
import { newsService } from '../services/news';
import { useAuth } from '../context/AuthContext';
import './ArticleCard.css';

const ArticleCard = ({ article }) => {
  const { user } = useAuth();

  const handleArticleClick = async (e) => {
    // Stop click if it's on a link inside the card
    if (e.target.tagName === 'A') {
      return;
    }

    if (user && article._id) {
      try {
        await newsService.trackInteraction(article._id, 'read');
      } catch (error) {
        console.error('Error tracking interaction:', error);
      }
    }
    window.open(article.url, '_blank');
  };

  const getBiasLabel = (bias) => {
    const labels = {
      left: 'Left Leaning',
      center: 'Center',
      right: 'Right Leaning',
      neutral: 'Neutral'
    };
    return labels[bias] || 'Unknown';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  // --- NEW: Helper function to generate the bias message ---
  const renderBiasInfo = (bias) => {
    if (!bias || !bias.label) return null;

    const label = getBiasLabel(bias.label);
    const confidence = Math.round(bias.confidence * 100);
    const keywords = bias.keywords || [];

    // Stop clicks on this area from opening the article
    const stopPropagation = (e) => {
      e.stopPropagation();
    };

    return (
      <div 
        className={`article-bias-info bias-${bias.label}`}
        onClick={stopPropagation} // Prevent card click
      >
        <div className="bias-header">
          <span className="bias-label">{label}</span>
          <span className="bias-confidence">{confidence}% Confidence</span>
        </div>
        
        {keywords.length > 0 && (
          <div className="bias-explanation">
            Based on terms like:
            <div className="bias-keywords-container">
              {keywords.map((keyword, index) => (
                <span key={index} className="bias-keyword-tag">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {keywords.length === 0 && (
          <div className="bias-explanation">
            This article was rated {label} with {confidence}% confidence.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="article-card" onClick={handleArticleClick}>
      {article.imageUrl && (
        <div className="article-image">
          <img src={article.imageUrl} alt={article.title} />
        </div>
      )}
      
      <div className="article-content">
        <div className="article-meta">
          <span className="article-source">{article.source}</span>
          <span className="article-date">{formatDate(article.publishedAt)}</span>
        </div>
        
        <h3 className="article-title">{article.title}</h3>
        
        {article.description && (
          <p className="article-description">{article.description}</p>
        )}
        
        <div className="article-footer">
          <span className="article-category">{article.category}</span>
          {/* We will render bias info below this */}
        </div>

        {/* --- THIS REPLACES THE OLD FOOTER AND KEYWORD DIVS --- */}
        {renderBiasInfo(article.bias)}

      </div>
    </div>
  );
};

export default ArticleCard;