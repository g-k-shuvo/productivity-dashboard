import React, { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import './TabStashWidget.css';

interface Tab {
  url: string;
  title: string;
  favIconUrl?: string;
}

interface TabStash {
  id: string;
  name: string;
  tabs: Tab[];
  createdAt: string;
}

const TabStashWidget: React.FC = () => {
  const [stashes, setStashes] = useState<TabStash[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [stashName, setStashName] = useState('');

  useEffect(() => {
    loadStashes();
  }, []);

  const loadStashes = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<{ success: boolean; data: TabStash[] }>('/tabstash');
      if (response.success) {
        setStashes(response.data);
      }
    } catch (error) {
      console.error('Failed to load stashes:', error);
    } finally {
      setLoading(false);
    }
  };

  const stashCurrentTabs = async () => {
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const tabData: Tab[] = tabs.map((tab) => ({
        url: tab.url || '',
        title: tab.title || '',
        favIconUrl: tab.favIconUrl,
      }));

      if (tabData.length === 0) {
        alert('No tabs to stash');
        return;
      }

      const name = stashName || `Stash ${new Date().toLocaleDateString()}`;
      await apiService.post('/tabstash', {
        name,
        tabs: tabData,
      });

      setStashName('');
      setShowCreate(false);
      await loadStashes();
    } catch (error) {
      console.error('Failed to stash tabs:', error);
      alert('Failed to stash tabs. Please try again.');
    }
  };

  const restoreStash = async (stash: TabStash) => {
    try {
      for (const tab of stash.tabs) {
        await chrome.tabs.create({ url: tab.url });
      }
    } catch (error) {
      console.error('Failed to restore stash:', error);
      alert('Failed to restore tabs. Please try again.');
    }
  };

  const deleteStash = async (stashId: string) => {
    if (!confirm('Are you sure you want to delete this stash?')) return;

    try {
      await apiService.delete(`/tabstash/${stashId}`);
      await loadStashes();
    } catch (error) {
      console.error('Failed to delete stash:', error);
      alert('Failed to delete stash. Please try again.');
    }
  };

  if (loading) {
    return <div className="tab-stash-widget loading">Loading tab stashes...</div>;
  }

  return (
    <div className="tab-stash-widget">
      <div className="tab-stash-header">
        <h3>Tab Stash</h3>
        <button onClick={() => setShowCreate(!showCreate)} className="stash-button">
          Stash Current Tabs
        </button>
      </div>

      {showCreate && (
        <div className="create-stash-form">
          <input
            type="text"
            placeholder="Stash name (optional)"
            value={stashName}
            onChange={(e) => setStashName(e.target.value)}
          />
          <div className="form-actions">
            <button onClick={stashCurrentTabs}>Create Stash</button>
            <button onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="stash-list">
        {stashes.length === 0 ? (
          <div className="empty-state">No tab stashes yet. Stash your current tabs to get started!</div>
        ) : (
          stashes.map((stash) => (
            <div key={stash.id} className="stash-item">
              <div className="stash-info">
                <h4>{stash.name}</h4>
                <span className="tab-count">{stash.tabs.length} tabs</span>
              </div>
              <div className="stash-actions">
                <button onClick={() => restoreStash(stash)} title="Restore tabs">
                  Restore
                </button>
                <button onClick={() => deleteStash(stash.id)} title="Delete stash" className="delete">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TabStashWidget;

