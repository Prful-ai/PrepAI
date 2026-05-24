import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  Search, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Award, 
  Sparkles, 
  RefreshCw, 
  BookOpen, 
  HelpCircle,
  Clock,
  ArrowRight,
  Info
} from "lucide-react";
import { TranscriptAssessment } from "../types";

export default function TranscriptAnalyzerView() {
  const [candidateName, setCandidateName] = useState("Alexander Cole");
  const [role, setRole] = useState("Senior Systems Engineer");
  const [transcriptText, setTranscriptText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState<TranscriptAssessment | null>(null);

  // Trigger transcript analyzer
  const handleAnalyzeTranscript = async () => {
    if (!transcriptText.trim()) {
      alert("Please paste the raw interview transcript or candidate notes first.");
      return;
    }

    setScanning(true);
    try {
      const response = await fetch("/api/analyze-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName,
          role,
          transcriptText
        })
      });

      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setReport(null);
  };

  const handleLoadSample = () => {
    setTranscriptText(`Interviewer: Thanks for coming Alexander. Let's start with system latency. How do you diagnose a slow rendering React layout page?
Alexander Cole: I look at rendering cascades first. Many developers place state variables too high in the tree which triggers universal tree resets. By encapsulating state inside custom hooks next to localized nodes, we isolate render cascades. For high-frequency layouts, we debounce keystrokes or load Zustand selector hooks.
Interviewer: Interesting. How do you handle screen-reader compatibility in dynamic menus?
Alexander Cole: We ensure standard semantic elements are used first. Where custom elements are required, we add exact aria-expanded, aria-controls, and role landmarks. We enforce automated eslint-plugin-jsx-a11y and CI testing, but also manually traverse forms using NVDA screen-readers to ensure standard keyboard loops don't lock focus.
Interviewer: Tell me about a past production regression you struggled with.
Alexander Cole: In my last assignment, a bundle update compiled duplicate React package versions into some build chunks, leading to runtime UI freezes. I launched webpack-bundle-analyzer to trace the duplication and configured yarn deduplicate triggers to bind dependencies safely.`);
  };

  return (
    <div className="space-y-8 p-1 animate-fade-in" id="transcript-analyzer-container">
      
      {/* Header ribbon bar */}
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <FileSpreadsheet className="h-4.5 w-4.5 text-[#2D9CDB]" />
            AI Raw Transcript & Note Evaluator
          </h2>
          <p className="text-xs text-slate-400">
            Paste Zoom transcript dialogue tracks, interview notes, or candidate assessments to run multi-point structural evaluation metrics.
          </p>
        </div>
      </div>

      {report ? (
        // Scorecard report view
        <div id="transcript-results-container" className="space-y-8 animate-fade-in">
          
          {/* Executive scorecard verdict */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Verdict badges block */}
            <div className="bg-[#1A2B3C] text-white rounded-xl p-6 flex flex-col justify-between text-center relative overflow-hidden" id="transcript-results-verdict">
              <div className="text-left">
                <span className="bg-[#2D9CDB]/15 text-[#2D9CDB] border border-[#2D9CDB]/40 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-bold uppercase inline-block">
                  Evaluation Verdict
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5 uppercase tracking-tight">{report.candidateName}</h3>
              </div>

              <div className="my-6">
                <span className={`inline-block text-2xl font-bold tracking-tight px-6 py-3 rounded-xl border font-sans uppercase 
                  ${report.hiringDecision.includes("Strong") 
                    ? "bg-[#27AE60]/15 text-[#27AE60] border-[#27AE60]/40" 
                    : report.hiringDecision.includes("Hire") 
                    ? "bg-[#2D9CDB]/15 text-white border-[#2D9CDB]/40" 
                    : "bg-[#F2994A]/15 text-[#F2994A] border-[#F2994A]/40"}`}>
                  {report.hiringDecision}
                </span>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleReset}
                  id="transcript-relaunch-btn"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-250 hover:text-white px-4 py-2 rounded-lg text-xs leading-none transition-colors border border-slate-700 inline-flex items-center space-x-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Evaluate New Transcript</span>
                </button>
              </div>
            </div>

            {/* Competency scores metrics */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between" id="transcript-results-metrics">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Competency Radar Ranks</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(report.competencyScores || {}).map(([key, val]: any) => {
                    const titles: any = {
                      technical: "Technical Depth Capabilities",
                      communication: "Communication articulation",
                      problemSolving: "Logical Problem Solving",
                      culturalFit: "TeamSTAR Method compliance"
                    };
                    return (
                      <div key={key} className="space-y-1 bg-slate-50 border border-slate-100 rounded-lg p-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700">{titles[key] || key}</span>
                          <span className="font-mono font-bold text-slate-900">{val}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative">
                          <div className="h-full bg-[#27AE60]" style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Executive Summary paragraph Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" id="transcript-results-summary">
            <h4 className="text-sm font-bold text-slate-900 mb-2 block">Executive candidate performance notes</h4>
            <p className="text-xs text-slate-650 leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-xl">
              {report.executiveSummary}
            </p>
          </div>

          {/* Highlights quotes vs Warnings Red flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Highlights List */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" id="transcript-results-highlights">
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="h-2 w-2 bg-[#27AE60] rounded-full animate-ping" />
                Key Highlights & Notable Claims
              </h4>
              <ul className="space-y-3">
                {report.highlights?.map((high, i) => (
                  <li key={i} className="flex items-start text-xs text-slate-600 bg-emerald-50/15 border border-emerald-100 p-3 rounded-lg leading-relaxed">
                    <CheckCircle className="h-4.5 w-4.5 text-[#27AE60] mr-2.5 shrink-0 mt-0.5" />
                    <span>"{high}"</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnings Red flags List */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" id="transcript-results-warnings">
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-white pb-1">
                <div className="h-2 w-2 bg-[#F2994A] rounded-full" />
                Warnings / Gaps Noted
              </h4>
              <ul className="space-y-3">
                {report.redFlags?.map((flag, i) => (
                  <li key={i} className="flex items-start text-xs text-slate-600 bg-amber-50/15 border border-amber-100 p-3 rounded-lg leading-relaxed">
                    <AlertTriangle className="h-4.5 w-4.5 text-[#F2994A] mr-2.5 shrink-0 mt-0.5" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Hiring Reasoning Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" id="transcript-results-reasoning">
            <h3 className="text-sm font-bold text-slate-900 mb-2 block">Hiring Decision Rationale</h3>
            <p className="text-xs text-slate-650 leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-xl">
              {report.detailedReasoning}
            </p>
          </div>

        </div>
      ) : (
        // Scanning setup View Page
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6" id="transcript-input-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Candidate Name input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 block">Candidate Full Name</label>
              <input 
                id="candname-input"
                type="text" 
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-[#2D9CDB] focus:bg-white focus:outline-none"
                placeholder="e.g., Alexander Cole"
              />
            </div>

            {/* Target Role input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 block">Target Job Position/Role</label>
              <input 
                id="target-role-scan-input"
                type="text" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-[#2D9CDB] focus:bg-white focus:outline-none"
                placeholder="e.g., Senior Systems Architect"
              />
            </div>

            {/* Transcript text area container */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-700 block">Zoom/Meet Dialogue Transcript or Notes Content</label>
                <button 
                  onClick={handleLoadSample}
                  id="sample-transcript-trigger"
                  type="button"
                  className="text-[#2D9CDB] hover:text-[#1a8bc9] font-bold font-mono tracking-tight text-[10px] hover:underline"
                >
                  [Load Sample Mock Transcript]
                </button>
              </div>
              <textarea
                id="transcript-raw-textarea"
                rows={10}
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#2D9CDB] focus:bg-white focus:outline-none resize-none placeholder-slate-400 font-mono leading-relaxed"
                placeholder="Paste raw conversation logs or interview notes here to analyze fit metrics..."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleAnalyzeTranscript}
              disabled={scanning || !transcriptText.trim()}
              id="transcript-scan-submit-btn"
              className={`text-white text-xs font-semibold px-6 py-3 rounded-lg flex items-center space-x-2 shadow-sm transition-all
                ${scanning || !transcriptText.trim()}
                  ? "bg-slate-250 cursor-not-allowed border-slate-250 text-slate-450" 
                  : "bg-[#1A2B3C] hover:bg-slate-800"}`}
            >
              {scanning ? (
                <>
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                  <span>Processing dialogue logs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5 text-[#2D9CDB]" />
                  <span>Execute Transcript Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
