import React, { useState, useEffect } from 'react';
import './BookmarksWidget.css';

interface Bookmark {
  id: string;
  title: string;
  url: string;
}

const BookmarksWidget: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if bookmarks permission is available
      if (!chrome.bookmarks) {
        setError('Bookmarks permission not available');
        setLoading(false);
        return;
      }

      // Get bookmark bar items
      const bookmarkBar = await chrome.bookmarks.getTree();
      const barNode = bookmarkBar[0]?.children?.find(
        (node) => node.id === '1' // Bookmark bar ID
      );

      if (!barNode || !barNode.children) {
        setBookmarks([]);
        setLoading(false);
        return;
      }

      // Convert to bookmark format (limit to 8 most recent)
      const bookmarkItems: Bookmark[] = barNode.children
        .filter((node) => node.url)
        .slice(0, 8)
        .map((node) => ({
          id: node.id,
          title: node.title || 'Untitled',
          url: node.url || '',
        }));

      setBookmarks(bookmarkItems);
      setLoading(false);
    } catch (err) {
      setError('Failed to load bookmarks');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bookmarks-widget loading">
        <div className="bookmarks-loading">Loading bookmarks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookmarks-widget error">
        <div className="bookmarks-error">{error}</div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bookmarks-widget empty">
        <div className="bookmarks-empty">No bookmarks found</div>
      </div>
    );
  }

  return (
    <div className="bookmarks-widget">
      <h3 className="bookmarks-title">Bookmarks</h3>
      <div className="bookmarks-grid">
        {bookmarks.map((bookmark) => (
          <a
            key={bookmark.id}
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bookmark-item"
            title={bookmark.title}
          >
            <div className="bookmark-icon">
              {bookmark.title.charAt(0).toUpperCase()}
            </div>
            <span className="bookmark-title">{bookmark.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default BookmarksWidget;

