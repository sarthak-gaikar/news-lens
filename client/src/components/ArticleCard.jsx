import React from 'react';
import { newsService } from '../services/news';
import { useAuth } from '../context/AuthContext';
import './ArticleCard.css';

const ArticleCard = ({ article }) => {
  const { user } = useAuth();

  const handleArticleClick = async () => {
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
          {article.bias && (
            <div className={`bias-indicator bias-${article.bias.label}`}>
              <span className="bias-dot"></span>
              {getBiasLabel(article.bias.label)}
            </div>
          )}
        </div>
        
        {/* {article.bias && (
          <div className="bias-bar-container">
            <div className="bias-bar">
              <div 
                className={`bias-marker bias-${article.bias.label}`}
                style={{
                  left: `${((article.bias.score + 1) / 2) * 100}%`
                }}
              ></div>
            </div>
            <div className="bias-labels">
              <span>Left</span>
              <span>Center</span>
              <span>Right</span>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ArticleCard;