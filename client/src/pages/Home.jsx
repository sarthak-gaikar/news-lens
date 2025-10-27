import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Link is still used
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
      
      // FIX 1: Call the new public route and get 10 articles
      const newsResponse = await newsService.getPublicNewsFeed({ limit: 3 });
      setFeaturedArticles(newsResponse.data || []);
      
      // FIX 2: Get bias stats
      const stats = await newsService.getBiasStats();
      setBiasStats(stats || []); // Ensure stats is an array
      
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalArticles = () => {
    // This will now sum the counts from the stats array
    return biasStats.reduce((total, stat) => total + stat.count, 0);
  };

  // FIX 4: Add a scroll handler
  const handleScrollToFeatures = (e) => {
    e.preventDefault();
    document.getElementById('how-it-works').scrollIntoView({
      behavior: 'smooth'
    });
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
                  {/* FIX 4: Change <Link> to <a> and add onClick */}
                  <a 
                    href="#how-it-works" 
                    className="btn btn-outline"
                    onClick={handleScrollToFeatures}
                  >
                    How It Works
                  </a>
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
              {/* This will now update dynamically */}
              <div className="stat-number">{getTotalArticles() > 0 ? `${getTotalArticles()}+` : '...'}</div>
              <div className="stat-label">Articles Analyzed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{biasStats.length || '...'}</div>
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
              {/* This will also update dynamically */}
              <span>{getTotalArticles() > 0 ? `${getTotalArticles()} articles` : '...'}</span>
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
        {/* FIX 4: Add id="how-it-works" here */}
        <section className="features-section" id="how-it-works">
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
              {/* FIX 3: Change 10 minutes to 3 minutes */}
              <p>Fresh news every 3 minutes from trusted sources</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;