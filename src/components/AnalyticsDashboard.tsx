// #TODO DEPRECATED: This file is legacy and should be removed. Use src/ui or src/core instead.
import React, { useEffect, useState } from 'react';
import { analyticsService, EngagementMetrics, SessionMetrics } from '../services/analyticsService';
import './AnalyticsDashboard.css';

const AnalyticsDashboard: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<SessionMetrics | null>(null);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadMetrics();
  }, [refreshKey]);

  const loadMetrics = () => {
    setCurrentSession(analyticsService.getCurrentSessionMetrics());
    setEngagementMetrics(analyticsService.getEngagementMetrics());
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      analyticsService.clear();
      loadMetrics();
    }
  };

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      currentSession: currentSession,
      engagementMetrics: engagementMetrics,
      allEvents: analyticsService.getAllEvents()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apophenia-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>📊 Analytics Dashboard</h1>
        <div className="header-actions">
          <button onClick={handleRefresh} className="refresh-button">
            🔄 Refresh
          </button>
          <button onClick={handleExportData} className="export-button">
            📥 Export
          </button>
          <button onClick={handleClearData} className="clear-button">
            🗑️ Clear Data
          </button>
        </div>
      </div>

      {/* Current Session Stats */}
      {currentSession && (
        <section className="dashboard-section current-session">
          <h2>Current Session</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Session ID</div>
              <div className="metric-value small">{currentSession.sessionId}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Duration</div>
              <div className="metric-value">
                {formatDuration(Date.now() - currentSession.startTime)}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Choices Made</div>
              <div className="metric-value">{currentSession.totalChoices}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Avg Choice Time</div>
              <div className="metric-value">
                {formatDuration(currentSession.averageChoiceTime)}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Images Generated</div>
              <div className="metric-value">{currentSession.imagesGenerated}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Errors</div>
              <div className="metric-value error">{currentSession.errors}</div>
            </div>
          </div>

          {/* Horror Intensity Chart */}
          {currentSession.horrorIntensityProgression.length > 0 && (
            <div className="intensity-chart">
              <h3>Horror Intensity Progression</h3>
              <div className="chart-bars">
                {currentSession.horrorIntensityProgression.map((intensity, index) => (
                  <div
                    key={index}
                    className="intensity-bar"
                    style={{
                      height: `${intensity * 100}%`,
                      backgroundColor: `hsl(${280 - intensity * 80}, 70%, 50%)`
                    }}
                    title={`Step ${index + 1}: ${(intensity * 100).toFixed(0)}%`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Fear Triggers */}
          {currentSession.fearTriggersIdentified.length > 0 && (
            <div className="fear-triggers">
              <h3>Fear Triggers Identified</h3>
              <div className="trigger-list">
                {currentSession.fearTriggersIdentified.map((trigger, index) => (
                  <span key={index} className="trigger-badge">{trigger}</span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Overall Engagement Metrics */}
      {engagementMetrics && (
        <section className="dashboard-section engagement-metrics">
          <h2>All-Time Engagement</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Total Sessions</div>
              <div className="metric-value">{engagementMetrics.totalSessions}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total Play Time</div>
              <div className="metric-value">
                {formatDuration(engagementMetrics.totalPlayTime)}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Avg Session Length</div>
              <div className="metric-value">
                {formatDuration(engagementMetrics.averageSessionLength)}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total Choices</div>
              <div className="metric-value">{engagementMetrics.totalChoicesMade}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Horror Effectiveness</div>
              <div className="metric-value">
                {formatPercentage(engagementMetrics.horrorEngineEffectiveness)}
              </div>
            </div>
          </div>

          {/* Image Generation Performance */}
          <div className="performance-section">
            <h3>Image Generation Performance</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Avg Generation Time</div>
                <div className="metric-value">
                  {formatDuration(engagementMetrics.imageGenerationPerformance.averageTime)}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Cache Hit Rate</div>
                <div className="metric-value success">
                  {formatPercentage(engagementMetrics.imageGenerationPerformance.cacheHitRate)}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Failure Rate</div>
                <div className="metric-value error">
                  {formatPercentage(engagementMetrics.imageGenerationPerformance.failureRate)}
                </div>
              </div>
            </div>
          </div>

          {/* Most Common Choices */}
          {engagementMetrics.mostCommonChoices.length > 0 && (
            <div className="choice-patterns">
              <h3>Most Common Choices</h3>
              <div className="choice-list">
                {engagementMetrics.mostCommonChoices.slice(0, 5).map((choice, index) => (
                  <div key={index} className="choice-item">
                    <div className="choice-rank">#{index + 1}</div>
                    <div className="choice-text">{choice.text}</div>
                    <div className="choice-count">{choice.count}×</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* No Data State */}
      {!currentSession && engagementMetrics?.totalSessions === 0 && (
        <div className="no-data">
          <p>No analytics data yet. Start playing to see your stats!</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
