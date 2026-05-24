import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCw, Terminal, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an active runtime exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    // Reset our error state to allow the app to attempt standard re-rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="w-full border border-rose-200 bg-rose-50/50 rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in flex flex-col md:flex-row gap-6 justify-between items-start" 
          id="localized-error-boundary-panel"
        >
          {/* Main Error Content Pillar */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600 border border-rose-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Audio Stream &amp; Media Pipeline Interrupted
                </h3>
                <p className="text-xs text-rose-700/80 font-medium">
                  An unexpected interruption occurred within the live streaming WebSocket or media connection.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Don't worry — your context has been persisted. This localized boundary prevented the main interview dashboard and sidebar navigation from crashing. You can safely try to reset the streaming channels below.
            </p>

            {/* Error stack log drawer toggle */}
            <div className="space-y-2">
              <button
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-700 tracking-wide uppercase font-mono cursor-pointer"
              >
                {this.state.showDetails ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" /> Hide Diagnostic Specs
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" /> Show Diagnostic Specs
                  </>
                )}
              </button>

              {this.state.showDetails && (
                <div className="bg-slate-900 text-slate-150 rounded-xl p-4 border border-slate-800 shadow-inner space-y-2 max-w-3xl overflow-x-auto">
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold tracking-wider uppercase border-b border-slate-800 pb-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Stack Telemetry Exception Logs
                  </div>
                  <pre className="text-[10px] font-mono leading-relaxed text-rose-300 whitespace-pre-wrap">
                    {this.state.error?.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-[9px] font-mono leading-relaxed text-slate-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Graceful Reconnect Action Panel */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition active:scale-95 cursor-pointer"
              id="graceful-reconnect-btn"
            >
              <RotateCw className="w-4 h-4 animate-spin-reverse" />
              Graceful Reconnect
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 bg-white transition cursor-pointer"
            >
              Full Window Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
