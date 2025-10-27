import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // --- FIX 1: Import useAuth ---
import { newsService } from '../services/news';
import ArticleCard from '../components/ArticleCard';
import NewsFilters from '../components/NewsFilters';
import './NewsFeed.css';

// --- A small component to show logged-out users ---
const SignupPrompt = () => {
  // --- FIX 2: Get the modal functions from the auth context ---
  const { setShowLoginModal, setShowRegisterModal } = useAuth();

  return (
    <div className="signup-prompt">
      <h2>See the Full Picture</h2>
      <p>This is a public preview of the latest news. For personalized articles, bias tracking, and your full feed, please sign in or create an account.</p>
      <div className="prompt-actions">
        {/* --- FIX 3: Changed from <Link> to <button> and added onClick --- */}
        <button 
          className="btn btn-primary"
          onClick={() => setShowLoginModal(true)}
        >
          Login
        </button>
        <button 
          className="btn btn-outline"
          onClick={() => setShowRegisterModal(true)}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

const NewsFeed = () => {
  const { user } = useAuth(); // Get user state
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    bias: 'all',
    source: 'all',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [filters, user]); 

  const loadInitialData = async () => {
    try {
      const [categoriesData, sourcesData] = await Promise.all([
        newsService.getCategories(),
        newsService.getSources()
      ]);
      setCategories(categoriesData);
      setSources(sourcesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (user) {
        // --- LOGGED-IN USER ---
        const response = await newsService.getNewsFeed(filters);
        setArticles(response.data);
        setPagination(response.pagination || {});
      } else {
        // --- LOGGED-OUT USER ---
        const response = await newsService.getPublicPreviewFeed();
        setArticles(response.data);
        setPagination({}); 
      }

    } catch (error) {
      if (user) {
        setError('Failed to load your feed. Please try again.');
      } else {
        setError('Failed to load the public preview. Please try again.');
      }
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 
    }));
  };

  const handleRefresh = async () => {
    if (!user) return; 

    try {
      setLoading(true);
      setError('');
      const response = await newsService.refreshNews();
      setArticles(response.data);
      setPagination(response.pagination || {});
    } catch (error) {
      setError('Failed to refresh news.');
      console.error('Error refreshing news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="news-feed">
      <div className="container">
        <div className="news-header">
          <div className="news-title-section">
            {user ? (
              <>
                <h1>Your News Feed</h1>
                <p>Personalized articles based on your preferences</p>
              </>
            ) : (
              <>
                <h1>Today's News Preview</h1>
                <p>The top 3 stories from every category</p>
              </>
            )}
          </div>
          
          {user && (
            <button 
              className="btn btn-outline refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh News'}
            </button>
          )}
        </div>

        {!user && <SignupPrompt />}

        {user && (
          <NewsFilters
            filters={filters}
            categories={categories}
            sources={sources}
            onFilterChange={handleFilterChange}
            loading={loading}
          />
        )}


        {error && (
          <div className="error-message">
            {error}
            <button onClick={loadArticles} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {loading && articles.length === 0 ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            Loading news articles...
          </div>
        ) : (
          <>
            <div className="articles-grid">
              {articles.map(article => (
                <ArticleCard key={article._id || article.id} article={article} />
              ))}
            </div>

            {articles.length === 0 && !loading && (
              <div className="no-articles">
                <h3>No articles found</h3>
                {user ? (
                  <>
                    <p>Try adjusting your filters or refresh the news.</p>
                    <button onClick={handleRefresh} className="btn btn-primary">
                      Refresh News
                    </button>
                  </>
                ) : (
                  <p>We couldn't find any articles for our public preview. Please check back later.</p>
                )}
              </div>
            )}

            {user && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                >
                  Previous
                </button>
                
                <div className="pagination-info">
                  Page {filters.page} of {pagination.totalPages}
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;