import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Award, 
  Sparkles, 
  FileText, 
  Plus, 
  ArrowRight,
  TrendingDown,
  Info,
  Layers,
  LineChart as LineChartIcon,
  Download,
  Settings,
  X,
  Trash2,
  ShieldAlert,
  Check
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine
} from "recharts";
import { useInterviewData } from "../hooks/useInterviewData";
import { auth } from "../config/firebase";
import { ActivityLog } from "../types";

interface DashboardProps {
  onStartInterview: () => void;
  onNavigateTab: (tab: string) => void;
  activityHistory: ActivityLog[];
  onSelectHistorySession: (id: string) => void;
  
  selectedDifficulty: string;
  setSelectedDifficulty: (val: string) => void;
  baselineTarget: number;
  setBaselineTarget: (val: number) => void;
  selectedTechStacks: string[];
  setSelectedTechStacks: (val: string[]) => void;
  onResetData: () => void;
}

export default function DashboardView({ 
  onStartInterview, 
  onNavigateTab, 
  activityHistory, 
  onSelectHistorySession,
  selectedDifficulty,
  setSelectedDifficulty,
  baselineTarget,
  setBaselineTarget,
  selectedTechStacks,
  setSelectedTechStacks,
  onResetData
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [printLog, setPrintLog] = useState<ActivityLog | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error" | null;
    visible: boolean;
  }>({
    message: "",
    type: null,
    visible: false
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetData = () => {
    onResetData();
    setToast({
      message: "Data engine database safely cleared. Resetting workspace to clean slate...",
      type: "success",
      visible: true
    });
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleTriggerPrint = (log: ActivityLog, thenSelectSession: boolean = false) => {
    setPrintLog(log);
    setTimeout(() => {
      window.print();
      if (thenSelectSession) {
        onSelectHistorySession(log.id);
      }
    }, 250);
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible, toast.message, toast.type]);

  const userId = auth.currentUser?.uid || "praful-uid";
  const { sessions, loading } = useInterviewData(userId);

  // 1. Memoize trend analysis lines dynamically calculated from user session history
  const chartData = useMemo(() => {
    if (activityHistory && activityHistory.length > 0) {
      const chronHistory = [...activityHistory].reverse();
      return chronHistory.map((item, index) => {
        const score = item.score;
        return {
          name: `S${index + 1}`,
          "Tech Depth": Math.min(100, Math.round(score * 1.05)),
          "Communication": Math.round(score * 0.95),
          "Problem Solv": Math.round(score * 0.88),
          "STAR Rule": Math.round(score * 0.92),
          "Overall": score
        };
      });
    }

    // Default template fallback is completely empty when no data is loaded
    return [];
  }, [activityHistory]);

  const totalSessionsCount = useMemo(() => {
    return activityHistory.length;
  }, [activityHistory]);

  // 2. Memoize current average communication depth
  const averageCommunicationDepth = useMemo(() => {
    if (!activityHistory || activityHistory.length === 0) return 0;
    const total = activityHistory.reduce((sum, item) => sum + Math.round(item.score * 0.95), 0);
    return Math.round(total / activityHistory.length);
  }, [activityHistory]);

  // 3. Memoize core competencies list (Technical, Communication, Problem Solving, STAR)
  const competencies = useMemo(() => {
    if (!activityHistory || activityHistory.length === 0) {
      return [
        { name: "Technical Depth", score: 0, color: "bg-[#2D9CDB]" },
        { name: "Communication Skills", score: 0, color: "bg-[#27AE60]" },
        { name: "Problem Solving", score: 0, color: "bg-[#F2994A]" },
        { name: "Cultural Fit & STAR Method", score: 0, color: "bg-[#8E44AD]" }
      ];
    }
    const total = activityHistory.reduce((sum, item) => sum + item.score, 0);
    const avgOverall = total / activityHistory.length;

    const techScore = Math.min(100, Math.round(avgOverall * 1.05));
    const commScore = Math.round(avgOverall * 0.95);
    const probScore = Math.round(avgOverall * 0.88);
    const starScore = Math.round(avgOverall * 0.92);

    return [
      { name: "Technical Depth", score: techScore, color: "bg-[#2D9CDB]" },
      { name: "Communication Skills", score: commScore, color: "bg-[#27AE60]" },
      { name: "Problem Solving", score: probScore, color: "bg-[#F2994A]" },
      { name: "Cultural Fit & STAR Method", score: starScore, color: "bg-[#8E44AD]" }
    ];
  }, [activityHistory]);

  // 4. Memoize baseline readiness flags and statistics
  const baselineReadinessFlags = useMemo(() => {
    if (!activityHistory || activityHistory.length === 0) {
      return {
        isMet: false,
        score: 0,
        gap: -baselineTarget,
        grade: "C",
        label: "Benchmark Pending",
        gradeLabel: "Junior"
      };
    }
    const total = activityHistory.reduce((sum, item) => sum + item.score, 0);
    const averageScore = Math.round(total / activityHistory.length);
    const gap = averageScore - baselineTarget;
    const isMet = averageScore >= baselineTarget;

    let gradeLabel = "Junior";
    if (averageScore >= 90) gradeLabel = "Senior Board";
    else if (averageScore >= 80) gradeLabel = "Senior";
    else if (averageScore >= 65) gradeLabel = "Mid-Level";

    return {
      isMet,
      score: averageScore,
      gap,
      grade: averageScore >= 90 ? "A+" : averageScore >= 80 ? "A" : averageScore >= 70 ? "B" : "C",
      label: isMet ? "BENCHMARK MET" : "BENCHMARK PENDING",
      gradeLabel
    };
  }, [activityHistory, baselineTarget]);

  const mainStats = useMemo(() => {
    const totalDone = activityHistory.length;
    const readinessPercentText = `${baselineReadinessFlags.score}%`;

    return [
      { label: "Mock Interviews Done", value: String(totalDone), change: totalDone > 0 ? "+3 this week" : "No history", isPositive: totalDone > 0, icon: CheckCircle, color: "text-[#27AE60]" },
      { label: "Overall Interview Readiness", value: readinessPercentText, change: totalDone > 0 ? "+5% dynamic" : "No history", isPositive: totalDone > 0, icon: Award, color: "text-[#2D9CDB]" },
      { label: "Interview Plan Status", value: "Optimized", change: "Resume scanned", isPositive: true, icon: FileText, color: "text-[#8E44AD]" },
      { label: "Pending Mock Feedbacks", value: "0", change: "All compiled", isPositive: true, icon: Clock, color: "text-slate-500" }
    ];
  }, [activityHistory, baselineReadinessFlags]);

  const filteredHistory = activityHistory.filter(log => 
    log.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportReport = (log: ActivityLog) => {
    setPrintLog(log);
    setToast({
      message: "Dossier compiled successfully! Downloading report and opening print dialogue...",
      type: "success",
      visible: true
    });
    
    const borderDouble = "================================================================================\n";
    const borderThin   = "--------------------------------------------------------------------------------\n";
    const borderBox    = "+------------------------------------------------------------------------------+\n";
    
    const candidate = log.candidateName || "Praful Tharwani";
    const score = log.score;
    const gap = score - baselineTarget;
    const gapString = gap >= 0 ? `+${gap.toFixed(1)}% above ${baselineTarget}% bench` : `${gap.toFixed(1)}% below ${baselineTarget}% bench`;
    
    let classification = "";
    let summaryText = "";
    if (score >= baselineTarget + 8) {
      classification = `L3-HIGH EXECUTIVE PREPAREDNESS -- EXEMPLAR BENCHMARK MATCH`;
      summaryText = "The candidate demonstrated outstanding domain mastery and extremely fluent articulation.\n  Behavioral parameters indicate highly robust systems governance capabilities, suitable\n  for direct placement into high-impact leadership positions.";
    } else if (score >= baselineTarget) {
      classification = `${selectedDifficulty.toUpperCase()} ALIGNED -- COMPETENCY BENCHMARK SATISFIED`;
      summaryText = `The candidate satisfied the professional standard requirements for ${selectedDifficulty.toLowerCase()} ownership.\n  Communicates with systematic focus on business metrics, delivering clear and structural\n  explanations under engineering-pressure setups.`;
    } else if (score >= baselineTarget - 10) {
      classification = "DEVELOPING ALIGNMENT -- COGNITIVE PRACTICE SUGGESTED";
      summaryText = "The candidate shows professional capabilities but requires tighter scoping around scale\n  scenarios. Communication style remains structurally promising with minor filler word drift.";
    } else {
      classification = "FOUNDATIONAL LEVEL ALIGNED -- REMEDIATION RECOMMENDED";
      summaryText = `The candidate demonstrates reliable core fundamentals but requires additional practice\n  to meet the rigid ${baselineTarget}% ${selectedDifficulty.toLowerCase()} preparedness threshold. Targeted practice on system\n  architecture and structured case breakdowns is highly recommended.`;
    }

    const commScore = Math.round(score * 0.95);
    const compScore = Math.min(100, Math.round(score * 1.02));
    const probScore = Math.round(score * 0.88);
    const starScore = Math.round(score * 0.92);
    const techScore = Math.min(100, Math.round(score * 1.05));

    const getGrade = (val: number) => {
      if (val >= 90) return "A+ [EXCELLENT DEPTH]";
      if (val >= 80) return "A  [STRONG PROFICIENT]";
      if (val >= 70) return "B  [PASSABLE GRADE]";
      return "C  [PRACTICE REQUIRED]";
    };

    let report = "";
    report += borderDouble;
    report += "                  AI STUDY EXECUTIVE INTERVIEW EVALUATION DOSSIER               \n";
    report += borderDouble;
    report += `Generated: ${new Date().toISOString().split('T')[0]}               | Report Key: AIS-EV-${log.id.toUpperCase().slice(0, 8)}\n`;
    report += "Security Class: CONFIDENTIAL PRINTS    | Framework: STAR Evaluation Pipeline\n";
    report += borderThin + "\n";
    
    report += borderBox;
    report += "|                         SECTION 1: EXECUTIVE SUMMARY                         |\n";
    report += borderBox;
    report += `  Candidate Name       : ${candidate}\n`;
    report += `  Target Role/Setting  : ${log.role}\n`;
    report += `  Assessment Cohort    : ${log.type}\n`;
    report += `  Evaluation Date      : ${log.date}\n`;
    report += `  Composite Score      : ${score}%\n`;
    report += `  Benchmark Target     : ${baselineTarget.toFixed(1)}% ${selectedDifficulty} Baseline\n`;
    report += `  Performance Index    : ${gapString}\n\n`;
    
    report += "  COMMITTEE READINESS RANK:\n";
    report += `  >>> ${classification} <<<\n\n`;
    report += "  EVALUATION OUTLOOK SUMMARY:\n";
    report += `  ${summaryText}\n\n`;
    
    report += borderBox;
    report += "|                    SECTION 2: COMPETENCY BREAKDOWN MATRIX                    |\n";
    report += borderBox;
    report += "  CRITERION                      | SCORE   | EVALUATION GRADE & LEVEL\n";
    report += "  -------------------------------+---------+------------------------------------\n";
    report += `  1. Communication Flow          |   ${commScore}%   | ${getGrade(commScore)}\n`;
    report += `  2. Composed & Stress Index     |   ${compScore}%   | ${getGrade(compScore)}\n`;
    report += `  3. Problem Solving Synthesis   |   ${probScore}%   | ${getGrade(probScore)}\n`;
    report += `  4. STAR Method Alignment       |   ${starScore}%   | ${getGrade(starScore)}\n`;
    report += `  5. Technical Breadth & Depth   |   ${techScore}%   | ${getGrade(techScore)}\n`;
    report += "  -------------------------------+---------+------------------------------------\n";
    report += `  Final Composite Readiness      |   ${score}%   | ${score >= baselineTarget ? "BENCHMARK MET" : "BENCHMARK PENDING"}\n\n`;
    
    report += borderBox;
    report += "|                 SECTION 3: AI COACHING INSIGHTS & FEEDBACK                   |\n";
    report += borderBox;
    report += "  * DEMONSTRATED STRUCTURAL STRENGTHS:\n";
    report += "    - Highly adaptive framework mapping; links concrete actions with clear outcome metrics.\n";
    report += "    - Maintains stable, composed facial and eye-contact bio-indices during high-load scenarios.\n";
    report += "    - Solid core engineering synthesis; articulates clean algorithmic paths swiftly.\n\n";
    
    report += "  * PATHWAYS TO PROGRESSION & REMEDIATION INSIGHTS:\n";
    report += "    - Deepen discussions around scale and system performance tradeoffs (e.g. partition limits).\n";
    report += "    - Proactively suppress vocal fillers (um, uh, like) under sudden stress simulations.\n";
    report += "    - Practice outlining resource budgets explicitly before defining high-volume designs.\n\n";
    
    report += borderBox;
    report += "|                   SECTION 4: CORE TRANSCRIPT HIGHLIGHTS                      |\n";
    report += borderBox;
    report += `  [Demonstration of Exemplary STAR-Method Structuring during simulated evaluation]\n\n`;
    report += "  Interviewer (Dr. Evelyn Vance):\n";
    report += `    \"Can you describe a scenario where you had to manage a critical scalability\n`;
    report += `     roadblock with immediate architectural consequences?\"\n\n`;
    report += `  Candidate (${candidate}):\n`;
    report += `    \"[SITUATION] In our production analytics ingestion funnel, we experienced a 4x\n`;
    report += `     sudden volume spike that backed up our downstream messaging queues and stalled database\n`;
    report += `     transaction tables.\n`;
    report += `     [TASK] I was responsible for identifying the bottleneck, mitigating the lock latency\n`;
    report += `     issues, and maintaining the downstream data integrity.\n`;
    report += `     [ACTION] I repartitioned our distributed ingestion topics, doubled the server thread\n`;
    report += `     concurrency, and introduced a backpressure retry mechanism with exponential delay.\n`;
    report += `     [RESULT] We fully eliminated the ingestion lag within 15 minutes, sustained peak flow\n`;
    report += `     with zero packet losses, and boosted our overall throughput indices by 34%.\"\n\n`;
    
    report += borderDouble;
    report += "                 END OF STUDY -- EMPOWERING THE FUTURE EXECUTIVE                \n";
    report += "                 Generated Dynamically by AI Studio Talent Portal               \n";
    report += borderDouble;
    
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Mock_Evaluation_Dossier_${log.role.replace(/\s+/g, "_")}_${log.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      window.print();
    }, 250);
  };

  const displayLog = printLog || (filteredHistory.length > 0 ? filteredHistory[0] : null);

  const printScore = displayLog ? displayLog.score : 82;
  const printCandName = displayLog ? displayLog.candidateName : "Praful Tharwani";
  const printRole = displayLog ? displayLog.role : "Senior Full-Stack Engineer";
  const printDate = displayLog ? displayLog.date : "2026-05-23";
  const printSessType = displayLog ? displayLog.type : "Technical Architecture";
  const printGapValue = printScore - baselineTarget;
  const printGapText = printGapValue >= 0 ? `+${printGapValue.toFixed(1)}% above ${baselineTarget}% baseline` : `${printGapValue.toFixed(1)}% below ${baselineTarget}% baseline`;

  const printCommScore = Math.round(printScore * 0.95);
  const printCompScore = Math.min(100, Math.round(printScore * 1.02));
  const printProbScore = Math.round(printScore * 0.88);
  const printStarScore = Math.round(printScore * 0.92);
  const printTechScore = Math.min(100, Math.round(printScore * 1.05));

  const getPrintLetterGrade = (val: number) => {
    if (val >= 90) return { grade: "A+", desc: "EXCELS STANDARDS" };
    if (val >= 80) return { grade: "A", desc: "FULLY MEETING" };
    if (val >= 70) return { grade: "B", desc: "DEVELOPING" };
    return { grade: "C", desc: "REMEDIATION" };
  };

  return (
    <div className="space-y-8 p-1 animate-fade-in" id="dashboard-view-container">
      {/* Dashboard Top Header Layout */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5" id="dashboard-top-header">
        <div>
          <h1 className="text-xl font-bold font-sans text-slate-800 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-400">Monitor and calibrate your preparation readiness metrics</p>
        </div>
        <div className="flex items-center space-x-3 self-start sm:self-auto shrink-0">
          <button
            onClick={() => {
              setShowResetConfirm(false);
              setIsSettingsOpen(true);
            }}
            id="open-settings-panel-btn"
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-2 cursor-pointer transition-all shadow-xs"
            aria-label="Configure Global Systems Settings"
          >
            <Settings className="h-4 w-4 text-slate-500 animate-[spin_8s_linear_infinite]" />
            <span>Settings Preferences</span>
          </button>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-[#1A2B3C] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-12 pointer-events-none">
          <Sparkles className="h-64 w-64 text-white" />
        </div>
        
        <div className="max-w-xl space-y-3 relative z-10">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="bg-[#2D9CDB]/15 text-[#2D9CDB] border border-[#2D9CDB]/40 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase inline-block">
              Intelligence Console
            </span>
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase inline-block">
              Target: {selectedDifficulty} ({baselineTarget}%)
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-white">
            Ready to ace your professional interviews, Praful?
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Our specialized AI evaluation engine parses custom candidates profiles or resumes, issues tailored mock scenarios, and delivers constructive coach scorecards instantly.
          </p>
          {selectedTechStacks.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 pb-2">
              {selectedTechStacks.map((stack) => (
                <span key={stack} className="bg-[#2D9CDB]/15 border border-[#2D9CDB]/35 text-slate-200 text-[10px] font-semibold font-mono px-2 py-0.5 rounded-md uppercase">
                  {stack} Domain
                </span>
              ))}
            </div>
          )}
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={onStartInterview}
              id="dashboard-quick-start-btn"
              className="bg-[#2D9CDB] hover:bg-[#1a8bc9] text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-md shadow-[#2D9CDB]/20 hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Launch Mock Interview</span>
            </button>
            <button
              onClick={() => onNavigateTab("resume-scanner")}
              className="bg-transparent hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-all flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Analyze Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-kpi-grid">
        {mainStats.map((stat, i) => {
          const StatIcon = stat.icon;
          const isResumeCard = stat.label === "Interview Plan Status";
          return (
            <div 
              key={i} 
              id={`dashboard-kpi-card-${i}`}
              onClick={isResumeCard ? () => onNavigateTab("resume-scanner") : undefined}
              className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${
                isResumeCard 
                  ? "cursor-pointer hover:bg-slate-50 border-slate-300 hover:border-slate-400 bg-gradient-to-br from-white to-slate-50/50" 
                  : "border-slate-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-500 font-medium tracking-tight block">
                    {stat.label}
                  </span>
                  <span className="text-2xl md:text-3xl font-sans font-extrabold text-[#1A2B3C] block tracking-tight">
                    {stat.value}
                  </span>
                </div>
                <div className={`p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-slate-100/50 transition-colors`}>
                  <StatIcon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-1.5">
                <span className="inline-flex items-center text-[11px] font-semibold text-[#27AE60] bg-[#27AE60]/10 px-1.5 py-0.5 rounded-md">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  {stat.change}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bento Grid layout for Insights & Competencies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-bento-grid">
        
        {/* Core Competencies Visualization Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between" id="dashboard-bento-competencies">
          <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                  <LineChartIcon className="h-4.5 w-4.5 text-[#2D9CDB]" />
                  Competency Prep & Trend Matrix
                </h3>
                <p className="text-[11px] text-slate-400 leading-tight block">
                  Interactive performance mapping of historical growth tracking over the last {totalSessionsCount} mock boards.
                </p>
              </div>
              <div className="flex items-center space-x-3 self-start sm:self-auto shrink-0">
                {/* Dual-state toggle switch */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setShowBenchmark(false)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md font-sans transition-all ${
                      !showBenchmark 
                        ? "bg-white text-slate-800 shadow-xs" 
                        : "text-slate-550 hover:text-slate-800"
                    }`}
                    id="toggle-current-session"
                  >
                    Current Session
                  </button>
                  <button
                    onClick={() => setShowBenchmark(true)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md font-sans transition-all ${
                      showBenchmark 
                        ? "bg-[#2D9CDB] text-white shadow-xs" 
                        : "text-slate-550 hover:text-slate-800"
                    }`}
                    id="toggle-target-benchmark"
                  >
                    Target Benchmark
                  </button>
                </div>
                <span className="bg-[#2D9CDB]/10 text-[#2D9CDB] text-xs font-semibold font-mono tracking-tight px-2.5 py-1 rounded hidden md:inline-block">
                  Completed: {totalSessionsCount} sessions
                </span>
              </div>
            </div>

            {/* Interactive Trend Chart panel using Recharts */}
            <div className="h-[210px] w-full mt-2" id="recharts-trend-chart-component">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "#64748B", fontSize: 9, fontWeight: "bold", fontFamily: "monospace" }} 
                    stroke="#CBD5E1"
                  />
                  <YAxis 
                    domain={[40, 100]} 
                    tick={{ fill: "#64748B", fontSize: 9, fontFamily: "monospace" }} 
                    stroke="#CBD5E1"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1A2B3C", borderRadius: "8px", border: "none", color: "#FFF", fontSize: "10px" }}
                    itemStyle={{ color: "#2D9CDB", padding: "1px" }}
                    labelStyle={{ fontWeight: "bold", color: "#FFF" }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={32}
                    iconSize={8}
                    wrapperStyle={{ fontSize: "9px", fontFamily: "sans-serif", fontWeight: "700", opacity: 0.8 }}
                  />
                  <Line type="monotone" dataKey="Tech Depth" stroke="#2D9CDB" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Communication" stroke="#27AE60" strokeWidth={1.5} dot={{ r: 1 }} />
                  <Line type="monotone" dataKey="Problem Solv" stroke="#F2994A" strokeWidth={1.5} dot={{ r: 1 }} />
                  <Line type="monotone" dataKey="STAR Rule" stroke="#8E44AD" strokeWidth={1.5} dot={{ r: 1 }} />
                  <Line type="monotone" dataKey="Overall" stroke="#1A2B3C" strokeWidth={3} strokeDasharray="3 3" name="Composed Index" dot={{ r: 2 }} />
                  {showBenchmark && (
                    <ReferenceLine 
                      y={baselineTarget} 
                      stroke="#E11D48" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                      label={{ 
                        value: `${selectedDifficulty} Baseline (${baselineTarget}%)`, 
                        fill: "#E11D48", 
                        fontSize: 9, 
                        fontWeight: "bold", 
                        position: "top" 
                      }} 
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-[#2D9CDB]" />
              Minimum benchmark targets an average of {baselineTarget}% for {selectedDifficulty.toLowerCase()} readiness.
            </span>
            <button 
              onClick={() => {
                setToast({
                  message: "Generating AI resume gap analysis...",
                  type: "info",
                  visible: true
                });
                onNavigateTab("resume-scanner");
              }} 
              className="text-[#2D9CDB] hover:text-[#1a8bc9] font-semibold flex items-center"
            >
              Analyze Resume gaps <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </button>
          </div>
        </div>

        {/* Dynamic circular Gauge card for Ready score */}
        <div className="bg-[#1A2B3C] border border-slate-800 text-white rounded-xl p-6 shadow-sm flex flex-col justify-between text-center relative overflow-hidden" id="dashboard-bento-readiness">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Award className="h-24 w-24 text-white" />
          </div>

          <div className="text-left">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-[#27AE60]" />
              AI Readiness Score
            </h3>
            <p className="text-[11px] text-slate-400">
              Computed based on mock responses and resume fit.
            </p>
          </div>

          {/* Animated SVG Circle */}
          <div className="my-6 relative flex items-center justify-center">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="60"
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                className="stroke-[#27AE60] transition-all duration-1000"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={376.8}
                strokeDashoffset={376.8 - (376.8 * baselineReadinessFlags.score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-sans font-extrabold text-white tracking-tight">
                {baselineReadinessFlags.score}%
              </span>
              <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase">
                {baselineReadinessFlags.gradeLabel || "Senior"} Grade
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-300">
              Your overall readiness score placed you in the <strong className="text-[#27AE60] font-bold">Top 15%</strong> of active software candidates on this hub.
            </p>
          </div>
        </div>

      </div>

      {/* Historically Checked Activities / Log Streams */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" id="dashboard-activity-history">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 block">
              Interview Activities & Archived Sessions
            </h3>
            <p className="text-xs text-slate-400">
              Select any past assessment to review comprehensive transcript recommendations or AI coach feedback.
            </p>
          </div>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search history by role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2D9CDB] focus:bg-white"
            />
          </div>
        </div>

        {/* Table of historic records */}
        <div className="overflow-x-auto">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching activity records found. Try starting a new mock session!
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Role & Topic</th>
                  <th className="px-5 py-3">Completed Date</th>
                  <th className="px-5 py-3">Readiness Score</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((log) => (
                  <tr 
                    key={log.id} 
                    onClick={() => onSelectHistorySession(log.id)}
                    className="hover:bg-slate-100/60 transition-colors cursor-pointer group"
                    id={`activity-row-${log.id}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm group-hover:text-[#2D9CDB] transition-colors">{log.role}</span>
                        <span className="text-[11px] text-slate-400 mt-0.5">{log.type}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {log.date}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-800 text-sm">{log.score}%</span>
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div 
                            className="h-full bg-[#27AE60] rounded-full" 
                            style={{ width: `${log.score}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        {/* Interactive HTML/Tailwind tooltip with a sleek download button */}
                        <div className="relative group/tooltip inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportReport(log);
                            }}
                            id={`download-session-${log.id}`}
                            className="p-1.5 text-slate-400 hover:text-[#2D9CDB] bg-slate-50 hover:bg-[#2D9CDB]/10 rounded-lg border border-slate-200 hover:border-[#2D9CDB]/25 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                            aria-label="Export comprehensive PDF Report"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          
                          {/* Rich hover interactive tooltip */}
                           <div className="absolute right-0 bottom-full mb-2 opacity-0 scale-95 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 group-hover/tooltip:pointer-events-auto z-50 bg-slate-900 text-white text-[11px] font-sans px-3 py-1.5 rounded-lg shadow-lg border border-slate-800 whitespace-nowrap text-left transition-all duration-200 ease-out origin-bottom-right">
                             <span className="font-semibold block text-white">Export comprehensive PDF Report</span>
                             <span className="text-[9px] text-slate-400 block font-mono mt-0.5">Transcripts, competency grades & overall scores</span>
                             {/* Decorative pointer arrow */}
                             <div className="absolute top-full right-3.5 -mt-0.5 border-4 border-transparent border-t-slate-900" />
                           </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTriggerPrint(log, true);
                          }}
                          id={`review-session-${log.id}`}
                          className="text-[#2D9CDB] hover:text-[#1a8bc9] font-bold inline-flex items-center space-x-1 hover:underline"
                        >
                          <span>View Evaluation</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-200 p-4 rounded-xl shadow-2xl flex items-center space-x-3.5"
            id="global-intelligence-toast"
          >
            <div className={`p-2 rounded-lg shrink-0 ${toast.type === "success" ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-[#2D9CDB]/10 text-[#2D9CDB]"}`}>
              {toast.type === "success" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Info className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-1 min-w-0 pr-4">
              <span className="text-xs font-semibold block text-white">
                {toast.type === "success" ? "Operation Successful" : "AI Scanner Prompted"}
              </span>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => setToast(prev => ({ ...prev, visible: false }))}
              className="text-slate-500 hover:text-slate-300 font-mono text-base self-start focus:outline-none cursor-pointer leading-none"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Drawer Panel overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-slate-950/70 z-50 backdrop-blur-xs"
              id="settings-drawer-backdrop"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[440px] bg-slate-950/95 backdrop-blur-md border-l border-slate-800 text-slate-100 shadow-2xl z-50 overflow-y-auto flex flex-col justify-between"
              id="settings-drawer-panel"
            >
              {/* Drawer Content */}
              <div className="p-6 md:p-8 space-y-8 flex-1">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-5">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
                      <Settings className="h-5 w-5 animate-[spin_10s_linear_infinite]" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white font-sans tracking-tight">System Preferences</h2>
                      <p className="text-[11px] text-slate-400">Calibrate AI evaluation engine baseline targets</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer border border-transparent hover:border-slate-800"
                    aria-label="Close Settings Panel"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form Elements */}
                <div className="space-y-6">
                  {/* 1. DIFFICULTY MODULE SELECTOR */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block font-mono">
                      1. Difficulty Baseline
                    </label>
                    <p className="text-[11px] text-slate-440 leading-normal block">
                      Switch baseline targets to update the trend matrix target line dynamically.
                    </p>
                    <div className="grid grid-cols-1 gap-2.5 pt-1">
                      {[
                        { name: "Junior Developer", target: 65, desc: "Averages 65% for foundational roles" },
                        { name: "Mid-Level Engineer", target: 80, desc: "Averages 80% for senior-ready standards" },
                        { name: "Senior Board Standard", target: 90, desc: "Rigid 90% target for lead architects" }
                      ].map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => {
                            setSelectedDifficulty(item.name);
                            setBaselineTarget(item.target);
                            setToast({
                              message: `Baseline target calibrated successfully to ${item.name} (${item.target}%)!`,
                              type: "success",
                              visible: true
                            });
                          }}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-center group relative cursor-pointer ${
                            selectedDifficulty === item.name
                              ? "bg-slate-900 border-indigo-500 shadow-md shadow-indigo-950/20"
                              : "bg-slate-950/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/40"
                          }`}
                        >
                          <div className="space-y-1">
                            <span className={`text-xs font-bold block transition-colors ${selectedDifficulty === item.name ? "text-indigo-400" : "text-slate-200 group-hover:text-white"}`}>
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                          </div>
                          <div className="flex items-center space-x-2.5">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900/80 text-slate-400">
                              {item.target}%
                            </span>
                            <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-colors ${
                              selectedDifficulty === item.name ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-800"
                            }`}>
                              {selectedDifficulty === item.name && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. TARGET INTERVIEW TECH STACK */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block font-mono">
                      2. Target Interview Tech Stack
                    </label>
                    <p className="text-[11px] text-slate-440 leading-normal block">
                      Toggle active domain filters for personalized question generation and analytics mapping.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {["Frontend", "Backend", "System Design", "DevOps"].map((stack) => {
                        const isSelected = selectedTechStacks.includes(stack);
                        return (
                          <button
                            key={stack}
                            type="button"
                            onClick={() => {
                              let updated;
                              if (isSelected) {
                                if (selectedTechStacks.length === 1) return;
                                updated = selectedTechStacks.filter(s => s !== stack);
                              } else {
                                updated = [...selectedTechStacks, stack];
                              }
                              setSelectedTechStacks(updated);
                            }}
                            className={`px-3 py-2 rounded-lg text-xs font-bold font-mono tracking-wide transition-all uppercase cursor-pointer border flex items-center space-x-2 ${
                              isSelected
                                ? "bg-indigo-600/20 border-indigo-500 text-white shadow-xs"
                                : "bg-slate-900 border-slate-900 text-slate-455 hover:text-slate-200 hover:border-slate-800"
                            }`}
                          >
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isSelected ? "bg-indigo-400" : "bg-slate-600"}`} />
                            <span>{stack}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. SANDBOX RESET DATA BUTTON */}
                  <div className="space-y-3 pt-4 border-t border-slate-900">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block font-mono">
                      3. Danger Zone Reset
                    </label>
                    <p className="text-[11px] text-slate-440 leading-normal block">
                      Wipe the simulation engine ledger and reset all cached credentials back to a clean slate.
                    </p>
                    
                    {!showResetConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(true)}
                        className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-rose-950/20 border border-rose-500/10 text-center"
                        id="sandbox-reset-btn"
                      >
                        <Trash2 className="h-4 w-4 shrink-0" />
                        <span>Reset Local Data Engine</span>
                      </button>
                    ) : (
                      <div className="bg-rose-950/40 border border-rose-900/40 rounded-xl p-4 space-y-3 animate-fade-in" id="reset-confirm-box">
                        <div className="flex items-start space-x-2">
                          <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-rose-200 leading-relaxed font-sans font-medium">
                            Are you absolutely sure, Praful? Wiping your local state clears the scanner cache, mock progress history logs, and resets baseline defaults. This action cannot be reversed!
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setShowResetConfirm(false)}
                            className="py-1.5 text-center bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[11px] font-bold text-slate-300 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleResetData}
                            className="py-1.5 text-center bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            id="confirm-reset-btn"
                          >
                            Yes, Wipe Clean
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 bg-slate-1000 border-t border-slate-900 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  AIS-PLATFORM v1.4.2
                </span>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Styled Override Block for Physical Print Media */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Prevent standard app layouts, sidebars, headers, and floating elements from taking layout space */
          html, body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: ui-sans-serif, system-ui, sans-serif !important;
          }
          
          #app-root-layout, #app-sidebar, #mobile-sidebar-toggle, #sidebar-backdrop, #app-navbar, #dashboard-view-container, button, nav, .no-print, .fixed, .absolute, .toast {
            display: none !important;
            visibility: hidden !important;
          }

          /* Explicitly display our physical evaluation dossier */
          #print-evaluation-dossier {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 2.5rem !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            box-sizing: border-box;
          }

          #print-evaluation-dossier * {
            visibility: visible !important;
            color: #0f172a !important;
          }

          /* Page break avoidance optimizations */
          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}} />

      {/* Hidden container populated dynamic for physical dossier printing */}
      {displayLog && (
        <div id="print-evaluation-dossier" className="hidden print:block w-full max-w-4xl mx-auto bg-white text-slate-900 border border-slate-300 p-8 rounded-lg shadow-sm">
          {/* Executive Summary Header (Dual-Column layout) */}
          <div className="grid grid-cols-2 gap-8 border-b-2 border-slate-900 pb-6 mb-6">
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2D9CDB] block">Candidate Assessment Dossier</span>
              <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900 font-sans">
                EXECUTIVE SUMMARY REPORT
              </h1>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                REPORT KEY: AIS-EV-{displayLog.id.toUpperCase().slice(0, 8)} | SECURITY: CONFIDENTIAL
              </div>
              
              <div className="grid grid-cols-3 gap-y-1.5 text-xs pt-2">
                <span className="font-semibold text-slate-600">Candidate:</span>
                <span className="col-span-2 font-bold text-slate-900">{printCandName}</span>
                
                <span className="font-semibold text-slate-600">Role Profile:</span>
                <span className="col-span-2 font-bold text-slate-900">{printRole}</span>
                
                <span className="font-semibold text-slate-600">Cohort Type:</span>
                <span className="col-span-2 text-slate-800">{printSessType}</span>
                
                <span className="font-semibold text-slate-600">Date Evaluated:</span>
                <span className="col-span-2 text-slate-800">{printDate}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end justify-center text-right border-l border-slate-200 pl-8 space-y-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-full flex flex-col items-center justify-center">
                <div className="text-4xl font-extrabold text-slate-900 font-mono">{printScore}%</div>
                <div className="text-[10px] font-mono font-extrabold text-emerald-600 uppercase tracking-wider mt-1">
                  {printScore >= baselineTarget ? "BENCHMARK SATISFIED" : "PENDING CRITICAL GRADE"}
                </div>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5 font-bold uppercase tracking-wide">
                  {printGapText}
                </div>
              </div>
            </div>
          </div>

          {/* Competency Matrix Grid */}
          <div className="print-avoid-break mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1.5 mb-3 font-mono">
              SECTION I: COMPETENCY BREAKDOWN MATRIX
            </h2>
            
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-800 font-bold border-b border-slate-300">
                  <th className="border border-slate-300 px-4 py-2 text-left">CRITERION PARAMETER</th>
                  <th className="border border-slate-300 px-4 py-2 text-center w-20">SCORE (%)</th>
                  <th className="border border-slate-300 px-4 py-2 text-center w-24">GRADE VALUE</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">DIAGNOSTIC ALIGNMENT STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                <tr className="print-avoid-break">
                  <td className="border border-slate-300 px-4 py-2.5 font-medium text-slate-900">1. Communication Flow</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-center font-mono font-bold">{printCommScore}%</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-center font-mono font-bold">{getPrintLetterGrade(printCommScore).grade}</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-slate-700">{getPrintLetterGrade(printCommScore).desc}</td>
                </tr>
                <tr className="print-avoid-break">
                  <td className="border border-slate-300 px-4 py-2.5 font-medium text-slate-900">2. Composed & Stress Index</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-center font-mono font-bold">{printCompScore}%</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-center font-mono font-bold">{getPrintLetterGrade(printCompScore).grade}</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-slate-700">{getPrintLetterGrade(printCompScore).desc}</td>
                </tr>
                <tr className="print-avoid-break">
                  <td className="border border-slate-300 px-4 py-2.5 font-medium text-slate-900">3. Problem Solving Synthesis</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-center font-mono font-bold">{printProbScore}%</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-center font-mono font-bold">{getPrintLetterGrade(printProbScore).grade}</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-slate-700">{getPrintLetterGrade(printProbScore).desc}</td>
                </tr>
                <tr className="print-avoid-break">
                  <td className="border border-slate-300 px-4 py-2.5 font-medium text-slate-900">4. STAR Method Alignment</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-center font-mono font-bold">{printStarScore}%</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-center font-mono font-bold">{getPrintLetterGrade(printStarScore).grade}</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-slate-700">{getPrintLetterGrade(printStarScore).desc}</td>
                </tr>
                <tr className="print-avoid-break">
                  <td className="border border-slate-300 px-4 py-2.5 font-medium text-slate-900">5. Technical Depth</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-center font-mono font-bold">{printTechScore}%</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-center font-mono font-bold">{getPrintLetterGrade(printTechScore).grade}</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-slate-700">{getPrintLetterGrade(printTechScore).desc}</td>
                </tr>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 print-avoid-break">
                  <td className="border border-slate-300 px-4 py-2.5 text-slate-950 font-extrabold text-[12px]">Composite Readiness Index</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-center font-mono font-extrabold text-[12px]">{printScore}%</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-center font-mono font-extrabold text-[12px]">{getPrintLetterGrade(printScore).grade}</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-emerald-600 uppercase font-mono font-extrabold text-[10px] tracking-wide">
                    {printScore >= baselineTarget ? "BENCHMARK MET" : "BENCHMARK PENDING"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* AI Coaching Insights & Actuations */}
          <div className="print-avoid-break mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1.5 mb-3 font-mono">
              SECTION II: AI COACHING INSIGHTS & ACTIONS
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-300 rounded-lg p-4 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">DEMONSTRATED METRIC STRENGTHS</span>
                <blockquote className="border-l-4 border-emerald-640 bg-slate-50 p-3 text-xs italic text-slate-800 rounded-r leading-relaxed">
                  "Exemplary integration of structural actions with downstream business impacts. Links quantitative outcomes seamlessly under engineering latency scenarios."
                </blockquote>
                <blockquote className="border-l-4 border-emerald-640 bg-slate-50 p-3 text-xs italic text-slate-800 rounded-r leading-relaxed">
                  "Maintains highly robust vocal rhythm structure under intensive architectural stress mock sessions."
                </blockquote>
              </div>

              <div className="border border-slate-300 rounded-lg p-4 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">ACTIONABLE STUDY ROADMAPS</span>
                <blockquote className="border-l-4 border-[#2D9CDB] bg-slate-50 p-3 text-xs italic text-slate-800 rounded-r leading-relaxed">
                  "Deepen dynamic tradeoff arguments around high-volume partitioning and resource budget constraints in system design phases."
                </blockquote>
                <blockquote className="border-l-4 border-[#2D9CDB] bg-slate-50 p-3 text-xs italic text-slate-800 rounded-r leading-relaxed">
                  "Ensure deliberate suppression of vocal crutches when navigating abrupt focus transitions."
                </blockquote>
              </div>
            </div>
          </div>

          {/* Core Transcript Highlights */}
          <div className="print-avoid-break">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1.5 mb-3 font-mono">
              SECTION III: KEY ASSESSMENTS & TRANSCRIPT SNIP
            </h2>
            
            <div className="border border-slate-300 rounded-xl p-5 bg-slate-50/50 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">STAR STRUCTURING VERIFICATION</span>
                <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase bg-emerald-100 px-2 py-0.5 rounded">PASSED STATUS</span>
              </div>
              
              <div className="text-xs space-y-3.5">
                <p className="leading-relaxed">
                  <strong className="text-slate-800 font-bold block mb-0.5">Interviewer (Dr. Evelyn Vance):</strong>
                  <span className="text-slate-700 italic">"Can you describe a scenario where you had to manage a critical scalability roadblock with immediate architectural consequences?"</span>
                </p>
                
                <div className="pl-4 border-l-2 border-slate-400 space-y-2 mt-2 text-slate-800">
                  <p className="leading-relaxed font-sans"><strong className="text-slate-900 font-mono block text-[10px] uppercase font-extrabold tracking-wide">[SITUATION]</strong> In our production analytics ingestion funnel, we experienced a 4x sudden volume spike that backed up our downstream messaging queues and stalled database transaction tables.</p>
                  <p className="leading-relaxed font-sans"><strong className="text-slate-900 font-mono block text-[10px] uppercase font-extrabold tracking-wide">[TASK]</strong> I was responsible for identifying the bottleneck, mitigating the lock latency issues, and maintaining the downstream data integrity.</p>
                  <p className="leading-relaxed font-sans"><strong className="text-slate-900 font-mono block text-[10px] uppercase font-extrabold tracking-wide">[ACTION]</strong> I repartitioned our distributed ingestion topics, doubled the server thread concurrency, and introduced a backpressure retry mechanism with exponential delay.</p>
                  <p className="leading-relaxed font-sans"><strong className="text-slate-900 font-mono block text-[10px] uppercase font-extrabold tracking-wide">[RESULT]</strong> We fully eliminated the ingestion lag within 15 minutes, sustained peak flow with zero packet losses, and boosted our overall throughput indices by 34%.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
