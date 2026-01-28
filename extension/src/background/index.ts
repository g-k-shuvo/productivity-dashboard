// Background Service Worker for Chrome Extension

console.log('Momentum background service worker loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Momentum extension installed');
    // Initialize default settings
    chrome.storage.local.set({
      settings: {
        searchProvider: 'google',
        timeFormat: '12h',
        temperatureUnit: 'celsius',
        widgets: {
          weather: true,
          tasks: true,
          links: true,
          clock: true,
          quotes: true,
        },
      },
    });
  } else if (details.reason === 'update') {
    console.log('Momentum extension updated');
  }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  if (message.type === 'GET_SETTINGS') {
    chrome.storage.local.get(['settings'], (result) => {
      sendResponse({ settings: result.settings });
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'SAVE_SETTINGS') {
    chrome.storage.local.set({ settings: message.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Periodic tasks (e.g., fetch daily content)
chrome.alarms.create('dailyContentUpdate', {
  periodInMinutes: 60, // Check every hour
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyContentUpdate') {
    // Fetch new daily content
    console.log('Updating daily content...');
    // Implementation will be added in Phase 3
  }
});

