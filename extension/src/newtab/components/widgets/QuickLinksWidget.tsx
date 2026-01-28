import React, { useState, useEffect } from 'react';
import { storage } from '../../../shared/utils/storage';
import { QuickLink } from '../../../shared/types';
import './QuickLinksWidget.css';

const QuickLinksWidget: React.FC = () => {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    const savedLinks = await storage.get<QuickLink[]>('quickLinks');
    setLinks(savedLinks || []);
  };

  const saveLinks = async (updatedLinks: QuickLink[]) => {
    await storage.set('quickLinks', updatedLinks);
    setLinks(updatedLinks);
  };

  const addLink = () => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;

    const url = newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`;

    const newLink: QuickLink = {
      id: Date.now().toString(),
      name: newLinkName.trim(),
      url,
    };

    saveLinks([...links, newLink]);
    setNewLinkName('');
    setNewLinkUrl('');
    setIsAdding(false);
  };

  const deleteLink = (linkId: string) => {
    const updatedLinks = links.filter((link) => link.id !== linkId);
    saveLinks(updatedLinks);
  };

  return (
    <div className="quick-links-widget">
      <div className="quick-links-header">
        <h3 className="quick-links-title">Quick Links</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="quick-links-add-btn"
          aria-label="Add link"
        >
          +
        </button>
      </div>

      {isAdding && (
        <div className="quick-links-form">
          <input
            type="text"
            value={newLinkName}
            onChange={(e) => setNewLinkName(e.target.value)}
            placeholder="Link name"
            className="quick-links-input"
          />
          <input
            type="text"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            placeholder="URL"
            className="quick-links-input"
          />
          <div className="quick-links-form-actions">
            <button onClick={addLink} className="quick-links-save-btn">
              Save
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewLinkName('');
                setNewLinkUrl('');
              }}
              className="quick-links-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="quick-links-grid">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="quick-link-item"
          >
            <div className="quick-link-icon">
              {link.name.charAt(0).toUpperCase()}
            </div>
            <span className="quick-link-name">{link.name}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                deleteLink(link.id);
              }}
              className="quick-link-delete"
              aria-label="Delete link"
            >
              ×
            </button>
          </a>
        ))}
        {links.length === 0 && !isAdding && (
          <div className="quick-links-empty">No links yet. Click + to add one!</div>
        )}
      </div>
    </div>
  );
};

export default QuickLinksWidget;

