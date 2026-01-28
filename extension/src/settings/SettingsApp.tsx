import React, { useEffect } from 'react';
import { useSettingsStore } from '../newtab/store/useSettingsStore';
import './SettingsApp.css';

const SettingsApp: React.FC = () => {
  const { settings, loadSettings, updateSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (!settings) {
    return <div className="settings-loading">Loading settings...</div>;
  }

  const handleWidgetToggle = (widgetName: string) => {
    updateSettings({
      widgets: {
        ...settings.widgets,
        [widgetName]: !settings.widgets[widgetName],
      },
    });
  };

  const handleSearchProviderChange = (provider: Settings['searchProvider']) => {
    updateSettings({ searchProvider: provider });
  };

  const handleTimeFormatChange = (format: '12h' | '24h') => {
    updateSettings({ timeFormat: format });
  };

  const handleTemperatureUnitChange = (unit: 'celsius' | 'fahrenheit') => {
    updateSettings({ temperatureUnit: unit });
  };

  return (
    <div className="settings-app">
      <div className="settings-container">
        <h1 className="settings-title">Momentum Settings</h1>

        <section className="settings-section">
          <h2 className="settings-section-title">Widgets</h2>
          <div className="settings-widgets">
            {Object.entries(settings.widgets).map(([key, value]) => (
              <label key={key} className="settings-widget-item">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleWidgetToggle(key)}
                />
                <span className="settings-widget-label">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section-title">Search Provider</h2>
          <div className="settings-radio-group">
            {(['google', 'bing', 'duckduckgo', 'ecosia'] as const).map((provider) => (
              <label key={provider} className="settings-radio-item">
                <input
                  type="radio"
                  name="searchProvider"
                  value={provider}
                  checked={settings.searchProvider === provider}
                  onChange={() => handleSearchProviderChange(provider)}
                />
                <span>{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section-title">Time Format</h2>
          <div className="settings-radio-group">
            <label className="settings-radio-item">
              <input
                type="radio"
                name="timeFormat"
                value="12h"
                checked={settings.timeFormat === '12h'}
                onChange={() => handleTimeFormatChange('12h')}
              />
              <span>12-hour</span>
            </label>
            <label className="settings-radio-item">
              <input
                type="radio"
                name="timeFormat"
                value="24h"
                checked={settings.timeFormat === '24h'}
                onChange={() => handleTimeFormatChange('24h')}
              />
              <span>24-hour</span>
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section-title">Temperature Unit</h2>
          <div className="settings-radio-group">
            <label className="settings-radio-item">
              <input
                type="radio"
                name="temperatureUnit"
                value="celsius"
                checked={settings.temperatureUnit === 'celsius'}
                onChange={() => handleTemperatureUnitChange('celsius')}
              />
              <span>Celsius</span>
            </label>
            <label className="settings-radio-item">
              <input
                type="radio"
                name="temperatureUnit"
                value="fahrenheit"
                checked={settings.temperatureUnit === 'fahrenheit'}
                onChange={() => handleTemperatureUnitChange('fahrenheit')}
              />
              <span>Fahrenheit</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsApp;
