import React, { useState, useEffect } from 'react';
import { storage } from '../../../shared/utils/storage';
import { Task } from '../../../shared/types';
import './TodoWidget.css';

const TodoWidget: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const today = new Date().toISOString().split('T')[0];
    const savedTasks = await storage.get<Task[]>(`tasks_${today}`);
    setTasks(savedTasks || []);
  };

  const saveTasks = async (updatedTasks: Task[]) => {
    const today = new Date().toISOString().split('T')[0];
    await storage.set(`tasks_${today}`, updatedTasks);
    setTasks(updatedTasks);
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      date: new Date().toISOString().split('T')[0],
    };

    saveTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    saveTasks(updatedTasks);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <div className="todo-widget">
      <h3 className="todo-title">Tasks</h3>
      <div className="todo-input-container">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a task..."
          className="todo-input"
        />
        <button onClick={addTask} className="todo-add-btn">
          Add
        </button>
      </div>
      <ul className="todo-list">
        {tasks.map((task) => (
          <li key={task.id} className={`todo-item ${task.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="todo-checkbox"
            />
            <span className="todo-text">{task.text}</span>
            <button
              onClick={() => deleteTask(task.id)}
              className="todo-delete-btn"
              aria-label="Delete task"
            >
              ×
            </button>
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="todo-empty">No tasks yet. Add one above!</li>
        )}
      </ul>
    </div>
  );
};

export default TodoWidget;

