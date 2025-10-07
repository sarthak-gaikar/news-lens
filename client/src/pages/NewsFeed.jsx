import React, { useState, useEffect } from 'react';
import { newsService } from '../services/news';
import ArticleCard from '../components/ArticleCard';
import NewsFilters from '../components/NewsFilters';
import './NewsFeed.css';

const NewsFeed = () => {
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
  }, [filters]);

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
      const response = await newsService.getNewsFeed(filters);
      setArticles(response.data);
      setPagination(response.pagination || {});
    } catch (error) {
      setError('Failed to load articles. Please try again.');
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await newsService.refreshNews();
      await loadArticles(); // Reload articles after refresh
    } catch (error) {
      setError('Failed to refresh news.');
      console.error('Error refreshing news:', error);
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
            <h1>Top News Stories</h1>
            <p>Stay informed with balanced perspectives</p>
          </div>
          <button 
            className="btn btn-outline refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh News'}
          </button>
        </div>

        <NewsFilters
          filters={filters}
          categories={categories}
          sources={sources}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

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
                <p>Try adjusting your filters or refresh the news.</p>
                <button onClick={handleRefresh} className="btn btn-primary">
                  Refresh News
                </button>
              </div>
            )}

            {pagination.totalPages > 1 && (
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