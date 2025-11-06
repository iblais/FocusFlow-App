'use client';

/**
 * ADHD Personal Data Scientist Dashboard
 * Main analytics dashboard integrating all visualization components
 */

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FocusHeatmap } from '@/components/analytics/focus-heatmap';
import { EnergyProductivityChart } from '@/components/analytics/energy-productivity-chart';
import { TaskCompletionSunburst } from '@/components/analytics/task-completion-sunburst';
import { DistractionTimeline } from '@/components/analytics/distraction-timeline';
import { ProductivityLandscape3D } from '@/components/analytics/productivity-landscape-3d';
import { WeeklyReportCard } from '@/components/analytics/weekly-report-card';
import { AnalyticsEngine } from '@/lib/analytics/analytics-engine';
import type {
  FocusHeatmapData,
  EnergyProductivityPoint,
  DistractionEvent,
  SunburstNode,
  ProductivityLandscape3D as Landscape3DData,
  WeeklyStats,
  RecognizedPattern,
  EnergyForecast,
  BurnoutRisk,
} from '@/types/analytics';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';

type DashboardView = 'overview' | 'weekly-report' | 'patterns' | 'predictions';

export default function AnalyticsDashboard() {
  const { data: session } = useSession();
  const [view, setView] = useState<DashboardView>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    end: new Date(),
  });

  // Data states
  const [focusData, setFocusData] = useState<FocusHeatmapData[]>([]);
  const [energyData, setEnergyData] = useState<EnergyProductivityPoint[]>([]);
  const [distractionData, setDistractionData] = useState<DistractionEvent[]>([]);
  const [sunburstData, setSunburstData] = useState<SunburstNode | null>(null);
  const [landscapeData, setLandscapeData] = useState<Landscape3DData | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);

  // Insights states
  const [patterns, setPatterns] = useState<RecognizedPattern[]>([]);
  const [energyForecast, setEnergyForecast] = useState<EnergyForecast | null>(null);
  const [burnoutRisk, setBurnoutRisk] = useState<BurnoutRisk | null>(null);

  const loadAnalyticsData = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);

    try {
      // Initialize analytics engine with userId
      const analyticsEngine = new AnalyticsEngine(session.user.id);

      // Fetch data from API
      const response = await fetch(
        `/api/analytics/data?userId=${session.user.id}&start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`
      );
      const data = await response.json();

      setFocusData(data.focusData || []);
      setEnergyData(data.energyData || []);
      setDistractionData(data.distractions || []);
      setSunburstData(data.sunburstData || null);
      setLandscapeData(data.landscapeData || null);
      setWeeklyStats(data.weeklyStats || null);

      // Run pattern recognition
      if (data.focusData?.length > 0) {
        const optimalTimes = await analyticsEngine.findOptimalFocusTimes(data.focusData);
        setPatterns(optimalTimes);
      }

      // Generate predictions
      if (data.energyData?.length > 0) {
        const forecast = await analyticsEngine.forecastEnergy(data.energyData);
        setEnergyForecast(forecast);

        const risk = await analyticsEngine.calculateBurnoutRisk({
          focusData: data.focusData,
          energyData: data.energyData,
          tasksCompleted: data.weeklyStats?.tasksCompleted.total || 0,
        });
        setBurnoutRisk(risk);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, dateRange]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const handleShareReport = async () => {
    // TODO: Generate and share victory card
    alert('Share feature coming soon!');
  };

  const handleExportPDF = async () => {
    // TODO: Generate PDF report
    alert('PDF export feature coming soon!');
  };

  const renderDateRangeSelector = () => (
    <div className="flex items-center gap-2">
      <Button
        onClick={() =>
          setDateRange({
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            end: new Date(),
          })
        }
        variant={dateRange.start.getTime() === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime() ? 'default' : 'outline'}
        size="sm"
      >
        Last 7 Days
      </Button>
      <Button
        onClick={() =>
          setDateRange({
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date(),
          })
        }
        variant={dateRange.start.getTime() === new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime() ? 'default' : 'outline'}
        size="sm"
      >
        Last 30 Days
      </Button>
      <Button
        onClick={() =>
          setDateRange({
            start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            end: new Date(),
          })
        }
        variant={dateRange.start.getTime() === new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).getTime() ? 'default' : 'outline'}
        size="sm"
      >
        Last 90 Days
      </Button>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Focus Heatmap */}
      {focusData.length > 0 && (
        <FocusHeatmap
          userId={session?.user?.id || ''}
          startDate={dateRange.start}
          endDate={dateRange.end}
          focusData={focusData}
        />
      )}

      {/* Energy/Productivity Correlation */}
      {energyData.length > 0 && (
        <EnergyProductivityChart
          userId={session?.user?.id || ''}
          data={energyData}
          showTrendline={true}
        />
      )}

      {/* Task Completion Sunburst */}
      {sunburstData && (
        <TaskCompletionSunburst
          userId={session?.user?.id || ''}
          data={sunburstData}
        />
      )}

      {/* Distraction Timeline */}
      {distractionData.length > 0 && (
        <DistractionTimeline
          userId={session?.user?.id || ''}
          distractions={distractionData}
        />
      )}

      {/* 3D Productivity Landscape */}
      {landscapeData && (
        <ProductivityLandscape3D
          userId={session?.user?.id || ''}
          data={landscapeData}
          autoRotate={false}
        />
      )}
    </div>
  );

  const renderWeeklyReport = () => (
    <div>
      {weeklyStats && (
        <WeeklyReportCard
          userId={session?.user?.id || ''}
          stats={weeklyStats}
          onShare={handleShareReport}
          onExportPDF={handleExportPDF}
        />
      )}
    </div>
  );

  const renderPatterns = () => (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">🔍 Recognized Patterns</h3>
        <div className="space-y-4">
          {patterns.map((pattern) => (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white mb-2">{pattern.insight}</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    {pattern.data.metric}: <span className="text-white font-medium">{pattern.data.value}</span>
                  </p>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">💡 Recommendation</p>
                    <p className="text-sm text-gray-300">{pattern.actionable.recommendation}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      pattern.confidence > 0.8
                        ? 'bg-green-500/20 text-green-400'
                        : pattern.confidence > 0.6
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}
                  >
                    {(pattern.confidence * 100).toFixed(0)}% confident
                  </div>
                  <div
                    className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      pattern.actionable.impact === 'high'
                        ? 'bg-red-500/20 text-red-400'
                        : pattern.actionable.impact === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {pattern.actionable.impact.toUpperCase()} impact
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {patterns.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">Not enough data to detect patterns yet</p>
              <p className="text-sm mt-2">Keep using the app and we'll start recognizing your patterns!</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );

  const renderPredictions = () => (
    <div className="space-y-6">
      {/* Energy Forecast */}
      {energyForecast && (
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">📊 Tomorrow's Energy Forecast</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-2">
              {energyForecast.hourlyPredictions.slice(0, 18).map((prediction) => (
                <div
                  key={prediction.hour}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-center"
                >
                  <p className="text-xs text-gray-400 mb-1">{prediction.hour}:00</p>
                  <p className="text-2xl font-bold text-purple-400">{prediction.predictedEnergy.toFixed(1)}</p>
                  <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${prediction.confidence * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              className={`p-4 rounded-lg border ${
                energyForecast.overallTrend === 'increasing'
                  ? 'bg-green-900/20 border-green-500/30'
                  : energyForecast.overallTrend === 'decreasing'
                  ? 'bg-red-900/20 border-red-500/30'
                  : 'bg-gray-900/20 border-gray-500/30'
              }`}
            >
              <p className="text-sm text-white">
                Overall Trend:{' '}
                <span className="font-semibold">
                  {energyForecast.overallTrend === 'increasing' && '📈 Increasing'}
                  {energyForecast.overallTrend === 'decreasing' && '📉 Decreasing'}
                  {energyForecast.overallTrend === 'stable' && '➡️ Stable'}
                </span>
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Burnout Risk */}
      {burnoutRisk && (
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">⚠️ Burnout Risk Assessment</h3>
          <div className="space-y-4">
            <div
              className={`p-6 rounded-lg border-2 ${
                burnoutRisk.riskLevel === 'critical'
                  ? 'bg-red-900/30 border-red-500'
                  : burnoutRisk.riskLevel === 'high'
                  ? 'bg-orange-900/30 border-orange-500'
                  : burnoutRisk.riskLevel === 'moderate'
                  ? 'bg-yellow-900/30 border-yellow-500'
                  : 'bg-green-900/30 border-green-500'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-white uppercase">{burnoutRisk.riskLevel} Risk</span>
                <span className="text-4xl font-bold text-white">{burnoutRisk.score}/100</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    burnoutRisk.riskLevel === 'critical'
                      ? 'bg-red-500'
                      : burnoutRisk.riskLevel === 'high'
                      ? 'bg-orange-500'
                      : burnoutRisk.riskLevel === 'moderate'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${burnoutRisk.score}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white">Contributing Factors:</h4>
              {burnoutRisk.factors.map((factor, index) => (
                <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">{factor.factor}</span>
                    <span className="text-sm font-semibold text-orange-400">
                      {(factor.contribution * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${factor.contribution * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-400 font-semibold mb-2">💡 Recommendation</p>
              <p className="text-sm text-gray-300">{burnoutRisk.recommendation}</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Please sign in to view analytics</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📊 Personal Data Scientist</h1>
            <p className="text-gray-400">Your ADHD analytics dashboard</p>
          </div>
          {renderDateRangeSelector()}
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setView('overview')}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'overview'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setView('weekly-report')}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'weekly-report'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Weekly Report
          </button>
          <button
            onClick={() => setView('patterns')}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'patterns'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Patterns
          </button>
          <button
            onClick={() => setView('predictions')}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'predictions'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Predictions
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : (
          <>
            {view === 'overview' && renderOverview()}
            {view === 'weekly-report' && renderWeeklyReport()}
            {view === 'patterns' && renderPatterns()}
            {view === 'predictions' && renderPredictions()}
          </>
        )}
      </div>
    </div>
  );
}
