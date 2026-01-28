import { create } from 'zustand';
import { Settings } from '../../shared/types';
import { storage } from '../../shared/utils/storage';

interface SettingsState {
  settings: Settings | null;
  loading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
}

const defaultSettings: Settings = {
  searchProvider: 'google',
  timeFormat: '12h',
  temperatureUnit: 'celsius',
  widgets: {
    weather: true,
    tasks: true,
    links: true,
    clock: true,
    quotes: true,
    bookmarks: true,
    greeting: true,
  },
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,

  loadSettings: async () => {
    set({ loading: true });
    try {
      const savedSettings = await storage.get<Settings>('settings');
      set({
        settings: savedSettings || defaultSettings,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({
        settings: defaultSettings,
        loading: false,
      });
    }
  },

  updateSettings: async (updates: Partial<Settings>) => {
    const currentSettings = get().settings || defaultSettings;
    const newSettings = { ...currentSettings, ...updates };
    
    try {
      await storage.set('settings', newSettings);
      set({ settings: newSettings });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  },
}));

