import React from 'react';
import ReactDOM from 'react-dom/client';
import SettingsApp from './SettingsApp';
import '../newtab/styles/main.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <SettingsApp />
  </React.StrictMode>
);

