import React, { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import './MetricsWidget.css';

interface Metric {
  id: string;
  metricType: string;
  value: number;
  date: string;
}

interface MetricStats {
  type: string;
  total: number;
  average: number;
  count: number;
  min: number;
  max: number;
}

const MetricsWidget: React.FC = () => {
  const [stats, setStats] = useState<MetricStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString().split('T')[0];
      let startDate = '';
      
      if (timeRange === 'today') {
        startDate = endDate;
      } else if (timeRange === 'week') {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        startDate = date.toISOString().split('T')[0];
      } else {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        startDate = date.toISOString().split('T')[0];
      }

      const response = await apiService.get<{ success: boolean; data: MetricStats[] }>(
        `/metrics/stats?startDate=${startDate}&endDate=${endDate}`
      );
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="metrics-widget loading">Loading metrics...</div>;
  }

  return (
    <div className="metrics-widget">
      <div className="metrics-header">
        <h3>Metrics</h3>
        <div className="time-range-selector">
          <button
            className={timeRange === 'today' ? 'active' : ''}
            onClick={() => setTimeRange('today')}
          >
            Today
          </button>
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
        </div>
      </div>
      <div className="metrics-list">
        {stats.length === 0 ? (
          <div className="empty-state">No metrics data available</div>
        ) : (
          stats.map((stat) => (
            <div key={stat.type} className="metric-item">
              <div className="metric-header">
                <h4>{stat.type.replace(/_/g, ' ').toUpperCase()}</h4>
              </div>
              <div className="metric-stats">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{stat.total.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average:</span>
                  <span className="stat-value">{stat.average.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Count:</span>
                  <span className="stat-value">{stat.count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Range:</span>
                  <span className="stat-value">
                    {stat.min.toFixed(2)} - {stat.max.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MetricsWidget;

