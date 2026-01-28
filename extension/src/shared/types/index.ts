// Shared types for the extension

export interface Settings {
  searchProvider: 'google' | 'bing' | 'duckduckgo' | 'ecosia';
  timeFormat: '12h' | '24h';
  temperatureUnit: 'celsius' | 'fahrenheit';
  widgets: {
    weather: boolean;
    tasks: boolean;
    links: boolean;
    clock: boolean;
    quotes: boolean;
    bookmarks: boolean;
    visionBoard?: boolean;
    tabStash?: boolean;
    pomodoro?: boolean;
    habits?: boolean;
    metrics?: boolean;
    worldClocks?: boolean;
    countdown?: boolean;
    soundscapes?: boolean;
    notesAI?: boolean;
    askAI?: boolean;
    [key: string]: boolean | undefined;
  };
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}

export interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

export interface Focus {
  text: string;
  date: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
}

export interface Quote {
  text: string;
  author?: string;
}

