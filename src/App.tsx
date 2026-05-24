import React, { useState } from "react";
import AuthView from "./components/AuthView";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import DashboardView from "./components/DashboardView";
import MockInterviewView from "./components/MockInterviewView";
import QuestionBankView from "./components/QuestionBankView";
import ResumeScannerView from "./components/ResumeScannerView";
import TranscriptAnalyzerView from "./components/TranscriptAnalyzerView";
import ErrorBoundary from "./components/ErrorBoundary";
import { MockSession, ActivityLog } from "./types";
import { useAuthManager } from "./hooks/useAuthManager";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [reviewingSession, setReviewingSession] = useState<MockSession | null>(null);

  const {
    authState,
    selectedDifficulty,
    baselineTarget,
    selectedTechStacks,
    activityHistory,
    completedSessions,
    updateUserDataObject,
    handleAddCompletedSession,
    handleResetUserData,
    handleLogOut,
    handleAuthSuccess
  } = useAuthManager();

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigateTab = (tab: string) => {
    setCurrentTab(tab);
    setReviewingSession(null);
  };

  // Direct select and review historic feedback loops
  const handleSelectHistorySession = (id: string) => {
    const match = completedSessions.find(s => s.id === id);
    if (match) {
      setReviewingSession(match);
      setCurrentTab("mock-interview");
    }
  };

  const handleClearReview = () => {
    setReviewingSession(null);
  };

  const handleLogOutAndReset = async () => {
    await handleLogOut();
    setCurrentTab("dashboard");
  };

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <ErrorBoundary>
            <DashboardView 
              onStartInterview={() => handleNavigateTab("mock-interview")}
              onNavigateTab={handleNavigateTab}
              activityHistory={activityHistory}
              onSelectHistorySession={handleSelectHistorySession}
              
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={(val) => updateUserDataObject({ difficulty: val })}
              baselineTarget={baselineTarget}
              setBaselineTarget={(val) => updateUserDataObject({ baselineTarget: val })}
              selectedTechStacks={selectedTechStacks}
              setSelectedTechStacks={(val) => updateUserDataObject({ selectedTechStacks: val })}
              onResetData={handleResetUserData}
            />
          </ErrorBoundary>
        );
      case "mock-interview":
        return (
          <ErrorBoundary>
            <MockInterviewView 
              onAddCompletedSession={handleAddCompletedSession}
              selectedSessionToReview={reviewingSession}
              onClearReview={handleClearReview}
            />
          </ErrorBoundary>
        );
      case "question-bank":
        return <QuestionBankView />;
      case "resume-scanner":
        return <ResumeScannerView />;
      case "transcript-analyzer":
        return <TranscriptAnalyzerView />;
      default:
        return (
          <ErrorBoundary>
            <DashboardView 
              onStartInterview={() => handleNavigateTab("mock-interview")}
              onNavigateTab={handleNavigateTab}
              activityHistory={activityHistory}
              onSelectHistorySession={handleSelectHistorySession}
              
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={(val) => updateUserDataObject({ difficulty: val })}
              baselineTarget={baselineTarget}
              setBaselineTarget={(val) => updateUserDataObject({ baselineTarget: val })}
              selectedTechStacks={selectedTechStacks}
              setSelectedTechStacks={(val) => updateUserDataObject({ selectedTechStacks: val })}
              onResetData={handleResetUserData}
            />
          </ErrorBoundary>
        );
    }
  };

  if (authState.loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 space-y-4" id="app-auth-loading">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <div className="absolute h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></div>
          </div>
        </div>
        <p className="text-xs text-slate-500 font-mono tracking-wider animate-pulse uppercase">
          Initializing Dynamic Gateway Authenticators...
        </p>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden" id="app-root-layout">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        onChangeTab={handleNavigateTab} 
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
      />

      {/* Main Viewport panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar dropdown enabled */}
        <Navbar user={authState.userProfile} onLogOut={handleLogOutAndReset} />

        {/* Scrolling view area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
