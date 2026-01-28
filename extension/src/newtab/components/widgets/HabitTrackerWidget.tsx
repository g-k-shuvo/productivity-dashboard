import React, { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import './HabitTrackerWidget.css';

interface Habit {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface HabitEntry {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
}

const HabitTrackerWidget: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<Record<string, HabitEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadHabits();
    loadEntries();
  }, [selectedDate]);

  const loadHabits = async () => {
    try {
      const response = await apiService.get<{ success: boolean; data: Habit[] }>('/habits');
      if (response.success) {
        setHabits(response.data);
      }
    } catch (error) {
      console.error('Failed to load habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    try {
      const promises = habits.map((habit) =>
        apiService.get<{ success: boolean; data: HabitEntry[] }>(`/habits/${habit.id}/entries?startDate=${selectedDate}&endDate=${selectedDate}`)
      );
      const results = await Promise.all(promises);
      const entriesMap: Record<string, HabitEntry[]> = {};
      results.forEach((result, index) => {
        if (result.success) {
          entriesMap[habits[index].id] = result.data;
        }
      });
      setEntries(entriesMap);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  const toggleHabit = async (habitId: string) => {
    try {
      const entry = entries[habitId]?.find((e) => e.date === selectedDate);
      await apiService.post(`/habits/${habitId}/checkin`, {
        date: selectedDate,
        completed: entry ? !entry.completed : true,
      });
      await loadEntries();
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  if (loading) {
    return <div className="habit-tracker-widget loading">Loading habits...</div>;
  }

  return (
    <div className="habit-tracker-widget">
      <div className="habit-tracker-header">
        <h3>Habit Tracker</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-picker"
        />
      </div>
      <div className="habits-list">
        {habits.length === 0 ? (
          <div className="empty-state">No habits yet. Create your first habit to get started!</div>
        ) : (
          habits.map((habit) => {
            const entry = entries[habit.id]?.find((e) => e.date === selectedDate);
            const isCompleted = entry?.completed || false;
            return (
              <div
                key={habit.id}
                className={`habit-item ${isCompleted ? 'completed' : ''}`}
                onClick={() => toggleHabit(habit.id)}
                style={{ borderLeftColor: habit.color || '#4CAF50' }}
              >
                <div className="habit-checkbox">
                  {isCompleted && <span>✓</span>}
                </div>
                <div className="habit-info">
                  <h4>{habit.name}</h4>
                  {habit.description && <p>{habit.description}</p>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HabitTrackerWidget;

