import React, { useState } from 'react';
import './NewsFilters.css';

const NewsFilters = ({ filters, categories, sources, onFilterChange, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterUpdate = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const biasOptions = [
    { value: 'all', label: 'All Biases' },
    { value: 'left', label: 'Left Leaning' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right Leaning' },
    { value: 'neutral', label: 'Neutral' }
  ];

  return (
    <div className="news-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        <button 
          className="expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▲' : '▼'} {isExpanded ? 'Less' : 'More'} Filters
        </button>
      </div>

      <div className={`filters-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="filter-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => handleFilterUpdate('category', e.target.value)}
            disabled={loading}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="bias">Media Bias</label>
          <select
            id="bias"
            value={filters.bias}
            onChange={(e) => handleFilterUpdate('bias', e.target.value)}
            disabled={loading}
          >
            {biasOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="source">News Source</label>
          <select
            id="source"
            value={filters.source}
            onChange={(e) => handleFilterUpdate('source', e.target.value)}
            disabled={loading}
          >
            <option value="all">All Sources</option>
            {sources.map(source => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="limit">Articles per page</label>
          <select
            id="limit"
            value={filters.limit}
            onChange={(e) => handleFilterUpdate('limit', parseInt(e.target.value))}
            disabled={loading}
          >
            <option value="10">10 articles</option>
            <option value="20">20 articles</option>
            <option value="30">30 articles</option>
            <option value="50">50 articles</option>
          </select>
        </div>
      </div>

      <div className="active-filters">
        {filters.category !== 'all' && (
          <span className="active-filter">
            Category: {filters.category}
            <button onClick={() => handleFilterUpdate('category', 'all')}>×</button>
          </span>
        )}
        {filters.bias !== 'all' && (
          <span className="active-filter">
            Bias: {biasOptions.find(opt => opt.value === filters.bias)?.label}
            <button onClick={() => handleFilterUpdate('bias', 'all')}>×</button>
          </span>
        )}
        {filters.source !== 'all' && (
          <span className="active-filter">
            Source: {filters.source}
            <button onClick={() => handleFilterUpdate('source', 'all')}>×</button>
          </span>
        )}
      </div>
    </div>
  );
};

export default NewsFilters;