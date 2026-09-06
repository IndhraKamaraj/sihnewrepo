import React, { useState, useEffect, useCallback } from 'react';
import { Train, NetworkStatus, TrainFilterOptions } from './types/train';
import { railwayDataService } from './services/RailwayDataService';
import { Header, ViewType } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { TrainExplorerView } from './components/views/TrainExplorerView';
import { TrainDetailsView } from './components/views/TrainDetailsView';
import { StationView } from './components/views/StationView';
import { SimulationPlaceholderView } from './components/views/SimulationPlaceholderView';
import { AnalyticsPlaceholderView } from './components/views/AnalyticsPlaceholderView';
import { Radio, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [trains, setTrains] = useState<Train[]>([]);
  const [allTrainsCount, setAllTrainsCount] = useState<number>(0);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string>('12951');
  const [selectedStationCode, setSelectedStationCode] = useState<string>('CNB');
  const [loading, setLoading] = useState<boolean>(true);

  const [filterOptions, setFilterOptions] = useState<TrainFilterOptions>({
    searchQuery: '',
    statusFilter: 'ALL',
    zoneFilter: 'ALL',
    sortBy: 'TRAIN_NO'
  });

  // Load network status & all train counts
  const loadNetworkData = useCallback(async () => {
    try {
      const status = await railwayDataService.getNetworkStatus();
      setNetworkStatus(status);
      setAllTrainsCount(status.activeTrainCount);
    } catch (err) {
      console.error('Failed to load network status:', err);
    }
  }, []);

  // Filter trains when filter options change
  const loadFilteredTrains = useCallback(async () => {
    try {
      setLoading(true);
      const results = await railwayDataService.searchAndFilterTrains(filterOptions);
      setTrains(results);
    } catch (err) {
      console.error('Failed to filter trains:', err);
    } finally {
      setLoading(false);
    }
  }, [filterOptions]);

  useEffect(() => {
    loadNetworkData();
  }, [loadNetworkData]);

  useEffect(() => {
    loadFilteredTrains();
  }, [loadFilteredTrains]);

  // Subscribe to centralized RailwayDataService state changes (step forward, replay playback, resets)
  useEffect(() => {
    const unsubscribe = railwayDataService.subscribe(() => {
      loadNetworkData();
      loadFilteredTrains();
    });
    return () => unsubscribe();
  }, [loadNetworkData, loadFilteredTrains]);

  const handleSelectTrain = (trainNumber: string) => {
    setSelectedTrainNumber(trainNumber);
    setCurrentView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStation = (stationCode: string) => {
    setSelectedStationCode(stationCode);
    setCurrentView('station');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateFilter = (updates: Partial<TrainFilterOptions>) => {
    setFilterOptions((prev) => ({ ...prev, ...updates }));
  };

  // Resolve currently selected train
  const activeSelectedTrain = trains.find((t) => t.trainNumber === selectedTrainNumber) ||
    trains[0] || null;

  // Determine if any train is currently in REPLAY / TEST MODE
  const isAnyReplayActive = trains.some(
    (t) =>
      t.provenance.feedType === 'REPLAY_TEST_FEED' ||
      t.provenance.sourceName.toUpperCase().includes('REPLAY')
  );

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-300 flex flex-col selection:bg-amber-500/20 selection:text-amber-300">
      {/* Primary Navigation & Telemetry Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedTrainNumber={activeSelectedTrain?.trainNumber}
        activeTrainCount={allTrainsCount}
        isReplayActive={isAnyReplayActive}
      />

      {/* Main Operational Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'dashboard' && (
          <DashboardView
            trains={trains}
            networkStatus={networkStatus}
            onSelectTrain={handleSelectTrain}
            onNavigateToExplorer={() => setCurrentView('explorer')}
            onNavigateToStation={handleSelectStation}
          />
        )}

        {currentView === 'explorer' && (
          <TrainExplorerView
            trains={trains}
            onSelectTrain={handleSelectTrain}
            searchOptions={filterOptions}
            onUpdateFilter={handleUpdateFilter}
          />
        )}

        {currentView === 'details' && (
          <TrainDetailsView
            train={activeSelectedTrain}
            onBack={() => setCurrentView('explorer')}
            onSelectStation={handleSelectStation}
            availableTrains={trains}
            onSelectTrain={handleSelectTrain}
          />
        )}

        {currentView === 'station' && (
          <StationView
            initialStationCode={selectedStationCode}
            onSelectTrain={handleSelectTrain}
          />
        )}

        {currentView === 'simulation' && (
          <SimulationPlaceholderView
            trains={trains}
            onSelectTrain={handleSelectTrain}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsPlaceholderView
            trains={trains}
            onSelectTrain={handleSelectTrain}
          />
        )}
      </main>

      {/* Railway Operations Footer */}
      <footer className="border-t border-slate-800 bg-[#0F172A]/80 py-4 px-4 sm:px-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isAnyReplayActive ? 'bg-amber-400 animate-ping' : 'bg-blue-400 animate-pulse'}`} />
            <span className="text-slate-400">RY-DYNAMICS · Railway ETA Intelligence Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            {isAnyReplayActive ? (
              <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                REPLAY / TEST MODE ACTIVE (Simulated Telemetry — Not Live Railway Data)
              </span>
            ) : (
              <span>Replay / Test Mode (Simulated Telemetry — Not Live Railway Data)</span>
            )}
            <span>•</span>
            <span className="text-slate-400 font-medium">SIH 26028 · Core Dynamic ETA Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
