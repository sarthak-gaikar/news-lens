import React from 'react';
import { newsService } from '../services/news';
import { useAuth } from '../context/AuthContext';
import './ArticleCard.css';

// --- UPDATED: LikeIcon now uses an SVG path ---
const LikeIcon = ({ filled }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    height="24px" 
    viewBox="0 0 24 24" 
    width="24px" 
    // Use a subtle red for filled, or 'none' for an outline
    fill={filled ? '#dc3545' : 'none'} 
    // Use a subtle grey for the outline
    stroke={filled ? 'none' : '#5f6368'} 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ verticalAlign: 'middle' }}
  >
    {/* This is the SVG path for a heart */}
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

// --- UPDATED: SaveIcon now uses fill='none' for the outline ---
const SaveIcon = ({ filled }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    height="24px" 
    viewBox="0 0 24 24" 
    width="24px" 
    // Use Google's blue for filled, or 'none' for an outline
    fill={filled ? '#1a73e8' : 'none'} 
    // Use a subtle grey for the outline
    stroke={filled ? 'none' : '#5f6368'} 
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ verticalAlign: 'middle' }}
  >
    {/* This path creates the bookmark shape */}
    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
  </svg>
);


const ArticleCard = ({ article }) => {
  const { user, isArticleLiked, isArticleSaved, toggleLike, toggleSave } = useAuth();

  const handleArticleClick = async (e) => {
    // Stop click if it's on a button
    if (e.target.closest('.card-action-btn')) {
      e.stopPropagation();
      return;
    }
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

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (!user || !toggleLike) return;
    toggleLike(article._id);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (!user || !toggleSave) return;
    toggleSave(article._id);
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

  const renderBiasInfo = (bias) => {
    if (!bias || !bias.label) return null;
    const label = getBiasLabel(bias.label);
    const confidence = Math.round(bias.confidence * 100);
    const keywords = bias.keywords || [];
    const stopPropagation = (e) => e.stopPropagation();
    return (
      <div 
        className={`article-bias-info bias-${bias.label}`}
        onClick={stopPropagation}
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
                <span key={index} className="bias-keyword-tag">{keyword}</span>
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

  const liked = user && isArticleLiked ? isArticleLiked(article._id) : false;
  const saved = user && isArticleSaved ? isArticleSaved(article._id) : false;

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
          
          {user && (
            <div className="card-actions">
              <button 
                className="card-action-btn"
                onClick={handleLikeClick}
                title={liked ? 'Unlike article' : 'Like article'}
              >
                <LikeIcon filled={liked} />
              </button>
              <button 
                className="card-action-btn"
                onClick={handleSaveClick}
                title={saved ? 'Unsave article' : 'Save article'}
              >
                <SaveIcon filled={saved} />
              </button>
            </div>
          )}
        </div>
        
        {renderBiasInfo(article.bias)}
      </div>
    </div>
  );
};

export default ArticleCard;