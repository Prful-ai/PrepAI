import React, { useMemo } from "react";
import { 
  Award, 
  MessageSquare, 
  Mic, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  User, 
  Bot, 
  Clock, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Printer
} from "lucide-react";
import { MockSession, ChatMessage } from "../types";
import { calculateSessionScores, EvaluationResult } from "../utils/evaluationEngine";

// Export both names to prevent any import discrepancies
export type InterviewSession = MockSession;

interface EvaluationSummaryViewProps {
  session: InterviewSession;
  onBack?: () => void;
}

export default function EvaluationSummaryView({ session, onBack }: EvaluationSummaryViewProps) {
  // Map ChatMessages to the speakers expected by the linguistic EvaluationEngine
  const transcriptData = useMemo(() => {
    if (!session || !session.messages) return [];
    return session.messages.map((msg) => ({
      speaker: msg.sender === "candidate" ? "Candidate" : "Interviewer",
      text: msg.text,
    }));
  }, [session]);

  // Compute detailed metrics on the fly using our utility engine
  const evaluation: EvaluationResult = useMemo(() => {
    return calculateSessionScores(transcriptData);
  }, [transcriptData]);

  // Safely extract competency score sets (fallback to precalculated assessment stats if available)
  const stats = useMemo(() => {
    const fromEngine = evaluation.competencyScores;
    const fromAssessment = session.assessment?.competencies;

    return [
      {
        label: "Technical Depth",
        value: fromEngine.technical,
        description: "Decomposition, tooling usage, and engineering accuracy",
        color: "bg-[#2D9CDB]"
      },
      {
        label: "Structural Communication",
        value: fromEngine.communication,
        description: "Articulated delivery and comfortable conceptual transitions",
        color: "bg-emerald-500"
      },
      {
        label: "Problem Solving",
        value: fromEngine.problemSolving,
        description: "Tradeoff analysis, risk mitigation, and systematic logic",
        color: "bg-purple-500"
      },
      {
        label: "STAR Framework Alignment",
        value: fromEngine.starRules,
        description: "Structuring answers around Situation, Task, Action, and Results",
        color: "bg-amber-500"
      }
    ];
  }, [evaluation, session]);

  const rawFillers = evaluation.fillerCounts;

  const totalFillerWords = rawFillers.total;
  const wordCount = evaluation.totalWords;
  const overallCalcScore = evaluation.competencyScores.overall;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-fade-in" id="evaluation-summary-container">
      {/* Embedded print overrides to optimize standard A4 paper format print layout */}
      <style>{`
        @media print {
          /* General page adjustments */
          body, html {
            background: white !important;
            color: #0f172a !important;
            font-size: 11px !important;
          }
          
          /* Hide app header navigation hubs, non-printable report tabs, and configuration panel side margins */
          header, 
          nav, 
          aside,
          footer, 
          #report-view-tabs,
          #interview-report-container > div:first-child,
          .print\\:hidden,
          #export-dossier-pdf-btn,
          #back-to-sessions-btn {
            display: none !important;
          }
          
          /* Expand summary container to full page width */
          #evaluation-summary-container {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          /* Flow layout smoothly into list blocks for printable dimensions */
          .grid {
            display: block !important;
          }
          
          .lg\\:grid-cols-12 {
            display: block !important;
          }
          
          .lg\\:col-span-7, 
          .lg\\:col-span-5 {
            width: 100% !important;
            display: block !important;
            margin-bottom: 2rem !important;
          }
          
          /* Expand chronological timeline view so all text prints */
          #transcript-scroll-viewport {
            max-height: none !important;
            overflow: visible !important;
            height: auto !important;
          }
          
          /* Force physical background element styling in system printers */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Form cards cleanly so they do not break inside the layout mid-sentence */
          #overall-score-card,
          #verbal-velocity-card,
          #clutter-index-card,
          #breakdown-metrics-section,
          #filler-crutches-section,
          #action-summary-feedback,
          #complete-transcript-timeline,
          .bg-white,
          .bg-slate-50 {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            border-color: #cbd5e1 !important;
          }
        }
      `}</style>

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase font-mono bg-slate-100 text-slate-600 border border-slate-200">
              Mock Session ID: #{session.id.slice(0, 8)}
            </span>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {session.date || "Today"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
            Session Evaluation Summary
          </h1>
          <p className="text-sm text-slate-500">
            For the position of <span className="font-semibold text-slate-800">{session.role}</span> ({session.type} Level)
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
            id="export-dossier-pdf-btn"
            title="Export evaluation sheet as standard PDF paper profile"
          >
            <Printer className="w-4 h-4" />
            Export Official Dossier (PDF)
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm cursor-pointer"
              id="back-to-sessions-btn"
            >
              ← Back to Board
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - Score Cards, Breakdown and Crutch Audits */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Top Level Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Overall Quality Rating Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between h-36" id="overall-score-card">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Performance Score</span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">{overallCalcScore}%</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-semibold text-emerald-600 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Grade A Evaluation
                </div>
              </div>
            </div>

            {/* Total Word Count Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between h-36" id="verbal-velocity-card">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Verbal Velocity</span>
                <div className="p-1.5 rounded-lg bg-[#2D9CDB]/10 text-[#2D9CDB]">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">{wordCount}</div>
                <div className="text-xs text-slate-500 mt-1">
                  spoken transcript words
                </div>
              </div>
            </div>

            {/* Linguistic Density Index */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between h-36" id="clutter-index-card">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Linguistic Clutter</span>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Mic className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-slate-800 font-mono tracking-tight">
                  {totalFillerWords} <span className="text-xs font-medium text-slate-400">counts</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {evaluation.fillerRatio.toFixed(1)}% of total speech
                </div>
              </div>
            </div>

          </div>

          {/* Breakdown Competency Metrics Dashboard */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" id="breakdown-metrics-section">
            <h2 className="text-base font-bold text-slate-950 mb-1 flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-slate-700" />
              Competency Domain Diagnostics
            </h2>
            <p className="text-xs text-slate-500 mb-6 border-b border-slate-100 pb-3">
              Multi-axis evaluation scoring designed to evaluate leadership traits and domain performance.
            </p>

            <div className="space-y-6">
              {stats.map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{stat.label}</h4>
                      <p className="text-[11px] text-slate-400 leading-none mt-0.5">{stat.description}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-800 font-mono">{stat.value}%</span>
                  </div>
                  
                  {/* Skill Progress Bar wrapper */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${stat.color}`}
                      style={{ width: `${stat.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verbal Filler Word Crutches Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" id="filler-crutches-section">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 text-amber-600" />
                Speech Cadence & Filler Crutch Auditing
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 border border-amber-250 text-amber-600 font-mono uppercase font-bold">
                Linguistic Scan
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
              {[
                { label: '"Um"', count: rawFillers.um, color: "text-amber-600", bg: "bg-amber-50" },
                { label: '"Uh"', count: rawFillers.uh, color: "text-amber-600", bg: "bg-amber-50" },
                { label: '"Like"', count: rawFillers.like, color: "text-rose-600", bg: "bg-rose-50" },
                { label: '"Basically"', count: rawFillers.basically, color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: '"You Know"', count: rawFillers.youKnow, color: "text-teal-600", bg: "bg-teal-50" }
              ].map((filler, idx) => (
                <div key={idx} className={`${filler.bg} border border-slate-100 rounded-xl p-3.5 text-center`}>
                  <div className={`text-xs font-bold leading-none ${filler.color} mb-1.5`}>{filler.label}</div>
                  <div className="text-lg font-black text-slate-800 font-mono leading-none">{filler.count}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">occurrences</div>
                </div>
              ))}
            </div>

            {/* Speech Coherence Feedback */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
              <div className="mt-0.5 p-1 rounded bg-amber-50 border border-amber-200 text-amber-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Linguistic Coherence Assessment</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {evaluation.feedback.fillerFeedback}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column - Feedback Strengths, Weaknesses, and Transcript Timeline */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Actionable Feedback summary widget */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden" id="action-summary-feedback">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 bg-slate-800/20 w-24 h-24 rounded-full blur-xl" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Intelligent AI Feedback Action Plan
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Key Strengths Observed
                </h4>
                <ul className="space-y-2 text-xs text-slate-200 pl-4.5 list-disc leading-relaxed">
                  {evaluation.feedback.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                  {session.assessment?.strengths && session.assessment.strengths.map((s, i) => (
                    <li key={`as-${i}`}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-800 my-4" />

              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Primary Action Items
                </h4>
                <ul className="space-y-2 text-xs text-slate-200 pl-4.5 list-disc leading-relaxed">
                  {evaluation.feedback.improvements.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                  {session.assessment?.weaknesses && session.assessment.weaknesses.map((w, i) => (
                    <li key={`aw-${i}`}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Complete Chronological Transcript Scroll Window */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col" id="complete-transcript-timeline">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <MessageSquare className="w-4.5 h-4.5 text-slate-700" />
                  Chronological Conversation Audit
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  TIMELINE LOGS INDEX: {session.messages?.length || 0} TOTAL UTTERANCES
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 border border-slate-250 text-slate-600 font-mono font-bold">
                TRANSCRIPT
              </span>
            </div>

            {/* Timeline Scroll Container */}
            <div className="max-h-[380px] overflow-y-auto pr-2 space-y-4 division-y division-slate-100" id="transcript-scroll-viewport">
              {session.messages && session.messages.length > 0 ? (
                session.messages.map((message: ChatMessage, idx: number) => {
                  const isInterviewer = message.sender === "interviewer";
                  return (
                    <div 
                      key={message.id || idx} 
                      className={`flex gap-3 text-xs leading-relaxed transition p-3 rounded-xl border ${
                        isInterviewer 
                          ? "bg-slate-50 border-slate-200 text-slate-700" 
                          : "bg-emerald-50/40 border-emerald-100 text-slate-800"
                      }`}
                    >
                      {/* Avatar Indicator */}
                      <div className="mt-0.5">
                        {isInterviewer ? (
                          <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-emerald-600 border border-emerald-500 flex items-center justify-center text-white">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Message bubble core */}
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className={`font-bold uppercase tracking-wider ${isInterviewer ? "text-slate-900" : "text-emerald-700"}`}>
                            {isInterviewer ? "AI Interviewer" : "You (Candidate)"}
                          </span>
                          <span className="text-slate-400 font-mono">
                            {message.timestamp || "Active Session"}
                          </span>
                        </div>
                        <p className="whitespace-pre-line text-slate-700 text-xs">
                          {message.text}
                        </p>

                        {/* Coachtips nested evaluation if candidate response has one */}
                        {message.coachTips && (
                          <div className="mt-2 bg-white/80 border border-amber-200/60 p-2 rounded-lg text-[11px] text-slate-600 flex items-start gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                            <div>
                              <span className="font-bold text-amber-700">Coach Feedback: </span>
                              {message.coachTips}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400 italic">
                  No dialog messages registered inside this session transcript state.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
