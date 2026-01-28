import React, { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import './SearchWidget.css';

const searchProviders = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  ecosia: 'https://www.ecosia.org/search?q=',
};

const SearchWidget: React.FC = () => {
  const { settings } = useSettingsStore();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const provider = settings?.searchProvider || 'google';
    const searchUrl = searchProviders[provider] + encodeURIComponent(query.trim());
    window.open(searchUrl, '_blank');
    setQuery('');
  };

  return (
    <form className="search-widget" onSubmit={handleSearch}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the web..."
        className="search-input"
      />
      <button type="submit" className="search-button" aria-label="Search">
        🔍
      </button>
    </form>
  );
};

export default SearchWidget;

