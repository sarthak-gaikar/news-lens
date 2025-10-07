import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { newsService } from '../services/news';
import ArticleCard from '../components/ArticleCard';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [biasStats, setBiasStats] = useState([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Get featured articles
      const newsResponse = await newsService.getNewsFeed({ limit: 6 });
      setFeaturedArticles(newsResponse.data || []);
      
      // Get bias stats
      const stats = await newsService.getBiasStats();
      setBiasStats(stats);
      
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalArticles = () => {
    return biasStats.reduce((total, stat) => total + stat.count, 0);
  };

  return (
    <div className="home">
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              See every side of every <span className="highlight">news story</span>
            </h1>
            <p className="hero-subtitle">
              NewsLens helps you understand media bias and get balanced perspectives 
              on current events from multiple sources.
            </p>
            <div className="hero-actions">
              {!user ? (
                <>
                  <Link to="/news" className="btn btn-primary">
                    Explore News
                  </Link>
                  <Link to="/news" className="btn btn-outline">
                    How It Works
                  </Link>
                </>
              ) : (
                <Link to="/news" className="btn btn-primary">
                  Go to News Feed
                </Link>
              )}
            </div>
          </div>
          
          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-number">{getTotalArticles()}+</div>
              <div className="stat-label">Articles Analyzed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{biasStats.length}</div>
              <div className="stat-label">Bias Categories</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">News Updates</div>
            </div>
          </div>
        </section>

        {/* Daily Briefing Section */}
        <section className="briefing-section">
          <div className="section-header">
            <h2>Daily Briefing</h2>
            <div className="briefing-stats">
              <span>{featuredArticles.length} stories</span>
              <span>•</span>
              <span>{getTotalArticles()} articles</span>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading latest news...</div>
          ) : (
            <div className="articles-grid">
              {featuredArticles.map(article => (
                <ArticleCard key={article._id || article.id} article={article} />
              ))}
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2>Why Choose NewsLens?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Bias Detection</h3>
              <p>AI-powered analysis reveals political leanings in news coverage</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Multiple Perspectives</h3>
              <p>Compare how different sources report the same story</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Personalized Feed</h3>
              <p>Get news tailored to your interests and preferences</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🕒</div>
              <h3>Real-time Updates</h3>
              <p>Fresh news every 10 minutes from trusted sources</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;