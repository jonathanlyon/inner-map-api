import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import QuestionFlow from './components/QuestionFlow';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingIndicator from './components/LoadingIndicator';
import JournalView from './components/JournalView';
import EvolutionView from './components/EvolutionView';
import Navigation from './components/Navigation';
import SessionDetailView from './components/SessionDetailView';
import Icon from './components/Icon';
import { AppState, ChatMessage, Insights } from './types';
import { generateAllInsights } from './services/geminiService';
import { getSessions, saveSession } from './services/storageService';
import { exportToPdf } from './utils/pdfExporter';

type AppAction =
  | { type: 'START_JOURNEY' }
  | { type: 'VIEW_DASHBOARD' }
  | { type: 'SELECT_JOURNAL_ENTRY'; payload: Insights }
  | { type: 'START_INSIGHT_GENERATION' }
  | { type: 'INSIGHT_GENERATION_SUCCESS'; payload: Insights }
  | { type: 'INSIGHT_GENERATION_FAILURE'; payload: string }
  | { type: 'SET_DASHBOARD_TAB'; payload: 'journal' | 'evolution' }
  | { type: 'INITIALIZE'; payload: Insights[] };

interface AppStateModel {
  appState: AppState;
  dashboardTab: 'journal' | 'evolution';
  currentInsights: Insights | null;
  error: string | null;
  journalEntries: Insights[];
}

const initialState: AppStateModel = {
  appState: 'welcome',
  dashboardTab: 'journal',
  currentInsights: null,
  error: null,
  journalEntries: [],
};

const appReducer = (state: AppStateModel, action: AppAction): AppStateModel => {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, journalEntries: action.payload, appState: action.payload.length > 0 ? 'dashboard' : 'welcome' };
    case 'START_JOURNEY':
      return { ...state, appState: 'question_flow', currentInsights: null, error: null };
    case 'VIEW_DASHBOARD':
      return { ...state, appState: 'dashboard', currentInsights: null };
    case 'SELECT_JOURNAL_ENTRY':
      return { ...state, appState: 'session_detail', currentInsights: action.payload };
    case 'START_INSIGHT_GENERATION':
      return { ...state, appState: 'generating', error: null };
    case 'INSIGHT_GENERATION_SUCCESS':
      const updatedEntries = [action.payload, ...state.journalEntries];
      return { ...state, appState: 'results', currentInsights: action.payload, journalEntries: updatedEntries };
    case 'INSIGHT_GENERATION_FAILURE':
      return { ...state, appState: 'welcome', error: action.payload };
    case 'SET_DASHBOARD_TAB':
      return { ...state, dashboardTab: action.payload };
    default:
      return state;
  }
};

const App: React.FC = () => {
  const [state, dispatch] = React.useReducer(appReducer, initialState);
  const { appState, dashboardTab, currentInsights, error, journalEntries } = state;

  useEffect(() => {
    const entries = getSessions();
    dispatch({ type: 'INITIALIZE', payload: entries });
  }, []);

  const handleStart = () => dispatch({ type: 'START_JOURNEY' });
  const handleViewDashboard = () => dispatch({ type: 'VIEW_DASHBOARD' });
  const handleSelectJournalEntry = (entry: Insights) => dispatch({ type: 'SELECT_JOURNAL_ENTRY', payload: entry });

  const handleConversationComplete = async (history: ChatMessage[]) => {
    dispatch({ type: 'START_INSIGHT_GENERATION' });
    try {
      const result = await generateAllInsights(history);
      const newEntry: Insights = { ...result, timestamp: Date.now() };

      // The first session is always a milestone
      if (journalEntries.length === 0) {
        newEntry.isMilestone = true;
        newEntry.milestoneReason = "The beginning of your journey. This marks your first step into self-reflection.";
      }

      saveSession(newEntry);
      dispatch({ type: 'INSIGHT_GENERATION_SUCCESS', payload: newEntry });
    } catch (err) {
      console.error("Failed to generate insights:", err);
      const errorMessage = "Sorry, an error occurred while creating your reflection. Please try starting a new journey.";
      dispatch({ type: 'INSIGHT_GENERATION_FAILURE', payload: errorMessage });
    }
  };
  
  const handleExport = () => {
    if (currentInsights) {
      const id = appState === 'results' ? 'new-results-container' : `session-detail-${currentInsights.timestamp}`;
      exportToPdf(id, `Inner-Map-${new Date(currentInsights.timestamp).toLocaleDateString()}.pdf`);
    }
  };

  const renderContent = () => {
    switch (appState) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStart} />;
      
      case 'dashboard':
        return (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="text-center mb-8">
                <h1 className="font-serif text-4xl font-bold text-[#2A2A2A]">Your Inner Evolution</h1>
                <p className="mt-2 text-lg text-slate-600">Witness how your inner landscape has shifted and transformed across your journey of self-discovery.</p>
            </header>
            <Navigation currentTab={dashboardTab} setTab={(tab) => dispatch({ type: 'SET_DASHBOARD_TAB', payload: tab })} />
            <div className="mt-8">
              {dashboardTab === 'journal' ? (
                <JournalView entries={journalEntries} onSelect={handleSelectJournalEntry} onStartNew={handleStart} />
              ) : (
                <EvolutionView entries={journalEntries} onSelect={handleSelectJournalEntry} onStartNew={handleStart} />
              )}
            </div>
          </div>
        );

      case 'question_flow':
        return <QuestionFlow onConversationComplete={handleConversationComplete} />;
      
      case 'generating':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-700 p-4">
            <LoadingIndicator className="w-16 h-16 text-[#D9A566]" />
            <h2 className="font-serif text-2xl mt-6 text-[#2A2A2A]">Crafting your inner map...</h2>
            <p className="max-w-sm mt-2 text-slate-500">This can take a moment as we reflect on your journey and create your unique visuals.</p>
          </div>
        );
      
      case 'results':
        return currentInsights ? (
            <div id="new-results-container" className="animate-fade-in w-full">
                <ResultsDisplay insights={currentInsights} />
                <div className="text-center mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button onClick={handleViewDashboard} className="bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 border border-slate-300">
                        View Dashboard
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 border border-slate-300">
                        <Icon name="Download" className="w-5 h-5"/>
                        Export PDF
                    </button>
                    <button onClick={handleStart} className="bg-[#D9A566] hover:bg-[#c99455] text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105">
                        Start New Journey
                    </button>
                </div>
            </div>
        ) : null;
      
      case 'session_detail':
        return currentInsights ? <SessionDetailView entry={currentInsights} onBack={handleViewDashboard} onExport={handleExport}/> : null;

      default:
        return <WelcomeScreen onStart={handleStart} />;
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center p-4 bg-[#F9F6F0]">
       <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
        }
        #pdf-export-area {
            background-color: #F9F6F0 !important;
            padding: 2rem;
        }
    `}</style>
      {error && (
        <div className="absolute top-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-lg z-10 animate-fade-in" role="alert">
          <strong className="font-bold">Oh no! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="w-full flex justify-center items-start">
        {renderContent()}
      </div>
    </main>
  );
};

export default App;