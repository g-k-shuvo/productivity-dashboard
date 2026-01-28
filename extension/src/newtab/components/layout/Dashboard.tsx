import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { checkProStatus } from '../../../shared/utils/proFeature';
import ClockWidget from '../widgets/ClockWidget';
import FocusWidget from '../widgets/FocusWidget';
import QuoteWidget from '../widgets/QuoteWidget';
import TodoWidget from '../widgets/TodoWidget';
import SearchWidget from '../widgets/SearchWidget';
import QuickLinksWidget from '../widgets/QuickLinksWidget';
import WeatherWidget from '../widgets/WeatherWidget';
import BookmarksWidget from '../widgets/BookmarksWidget';
import VisionBoardWidget from '../widgets/VisionBoardWidget';
import TabStashWidget from '../widgets/TabStashWidget';
import PomodoroWidget from '../widgets/PomodoroWidget';
import HabitTrackerWidget from '../widgets/HabitTrackerWidget';
import MetricsWidget from '../widgets/MetricsWidget';
import WorldClocksWidget from '../widgets/WorldClocksWidget';
import CountdownWidget from '../widgets/CountdownWidget';
import SoundscapesWidget from '../widgets/SoundscapesWidget';
import NotesAIWidget from '../widgets/NotesAIWidget';
import AskAIWidget from '../widgets/AskAIWidget';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { settings, loadSettings } = useSettingsStore();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    loadSettings();
    checkProStatus().then(setIsPro);
  }, [loadSettings]);

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <SearchWidget />
        <div className="dashboard-top-row">
          {settings?.widgets.weather && <WeatherWidget />}
          {settings?.widgets.clock && <ClockWidget />}
        </div>
        {settings?.widgets.quotes && <QuoteWidget />}
        {settings?.widgets.quotes && <FocusWidget />}
        <div className="dashboard-bottom-row">
          {settings?.widgets.tasks && <TodoWidget />}
          {settings?.widgets.links && <QuickLinksWidget />}
        </div>
        {settings?.widgets.bookmarks && <BookmarksWidget />}
        
        {/* Pro Feature Widgets */}
        {isPro && settings?.widgets.visionBoard && <VisionBoardWidget />}
        {isPro && settings?.widgets.tabStash && <TabStashWidget />}
        {isPro && settings?.widgets.pomodoro && <PomodoroWidget />}
        {isPro && settings?.widgets.habits && <HabitTrackerWidget />}
        {isPro && settings?.widgets.metrics && <MetricsWidget />}
        {isPro && settings?.widgets.worldClocks && <WorldClocksWidget />}
        {isPro && settings?.widgets.countdown && <CountdownWidget />}
        {isPro && settings?.widgets.soundscapes && <SoundscapesWidget />}
        {isPro && settings?.widgets.notesAI && <NotesAIWidget />}
        {isPro && settings?.widgets.askAI && <AskAIWidget />}
      </div>
    </div>
  );
};

export default Dashboard;

