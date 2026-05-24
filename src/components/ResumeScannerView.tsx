import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  HelpCircle, 
  RefreshCw, 
  Award,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  Landmark,
  Cpu,
  FileCode,
  ShieldCheck,
  Check
} from "lucide-react";
import { ResumeAssessment } from "../types";
import { saveResumeMetadata } from "../utils/resumeCache";

export default function ResumeScannerView() {
  const [domain, setDomain] = useState<"Standard" | "UPSC">("Standard");
  const [role, setRole] = useState("Senior Frontend Architect");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [assessment, setAssessment] = useState<ResumeAssessment | null>(null);

  // UPSC DAF parsed metadata parameters
  const [upscState, setUpscState] = useState("Uttar Pradesh");
  const [upscCadre, setUpscCadre] = useState("IAS, IPS, IFS");
  const [upscElective, setUpscElective] = useState("Sociology");
  const [upscAchievements, setUpscAchievements] = useState("NCC 'C' Certificate, Inter-University Debate Captain");

  // Format and synchronize UPSC DAF profile parameters automatically
  useEffect(() => {
    if (domain === "UPSC") {
      setResumeText(`UPSC Civil Services Profile Dossier / Detailed Application Form (DAF)
========================================================================
Home State / Cadre Preference: ${upscState} (Preference: ${upscCadre})
Academic Electives & Graduation Stream: Optional Subject in ${upscElective}
Extra-Curricular Achievements & Activities: ${upscAchievements}`);
    }
  }, [domain, upscState, upscCadre, upscElective, upscAchievements]);

  // File Upload Drag and Drop states
  const [dragActive, setDragActive] = useState(false);
  const [fileScanningState, setFileScanningState] = useState<"idle" | "scanning" | "completed">("idle");
  const [scanningProgress, setScanningProgress] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const pseudoSteps = [
    { label: "Extracting text structure...", desc: "Applying OCR layout parsing & structural PDF segment isolation" },
    { label: "Parsing technical competencies...", desc: "Extracting skills, technologies, optional subjects, and academic milestones" },
    { label: "Matching experience matrices...", desc: "Cross-referencing domain scope, achievements & tenure stats against AI baseline" }
  ];

  const triggerFileScanAnimation = (fileName: string) => {
    setUploadedFileName(fileName);
    setFileScanningState("scanning");
    setScanningProgress(0);
    setCurrentStepIdx(0);

    const duration = 3000; // 3 seconds total simulation
    const intervalTime = 30; // update every 30ms
    const totalSteps = duration / intervalTime;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      const progress = Math.min(Math.round((stepCount / totalSteps) * 100), 100);
      setScanningProgress(progress);

      if (progress < 33) {
        setCurrentStepIdx(0);
      } else if (progress < 66) {
        setCurrentStepIdx(1);
      } else {
        setCurrentStepIdx(2);
      }

      if (stepCount >= totalSteps) {
        clearInterval(timer);
        setFileScanningState("completed");
      }
    }, intervalTime);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processUploadedFile = (file: File) => {
    const ext = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    const allowed = ["pdf", "docx", "doc", "txt"];
    if (!allowed.includes(ext)) {
      alert("Invalid format. Please drag or upload a .pdf, .docx, or .txt file.");
      return;
    }

    if (domain === "UPSC") {
      const mockDAFText = `[Parsed DAF File Content - Title: ${file.name}]\n\nHome State: Chhattisgarh\nPreferred Cadre: IAS, IPS, IFS\nAcademic Elective: Public Administration\nAchievements: NCC 'C' Certificate & Inter-University Debate Captain`;
      setResumeText(mockDAFText);
      setUpscState("Chhattisgarh");
      setUpscCadre("IAS, IPS, IFS");
      setUpscElective("Public Administration");
      setUpscAchievements("NCC 'C' Certificate & Inter-University Debate Captain");

      saveResumeMetadata({
        hometown: "Raipur",
        homeState: "Chhattisgarh",
        academicSubjects: ["Public Administration", "History"],
        achievements: ["NCC 'C' Certificate", "Inter-University Debate Captain"]
      });
    } else {
      const mockResumeText = `[Parsed Resume File Content - Title: ${file.name}]\n\nProfessional summary: Highly experienced UI Architect specializing in crafting robust React dynamic platforms, optimizing bundlers (Vite/Rollup), and adhering to screen reader WCAG levels. Competent in TypeScript, clean state orchestration (Zustand/Context), and CI/CD layout integrations...`;
      setResumeText(mockResumeText);

      saveResumeMetadata({
        hometown: "Phoenix",
        homeState: "Arizona",
        academicSubjects: ["Computer Science", "Human-Computer Interaction"],
        achievements: ["Employee of the Year", "React Conference Speaker 2024"],
        techGapFrameworks: ["Vue.js", "Angular", "Svelte", "Next.js"]
      });
    }

    triggerFileScanAnimation(file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processUploadedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processUploadedFile(file);
    }
  };

  // Run analyzer trigger
  const handleScanResume = async () => {
    if (!resumeText.trim()) {
      alert("Please paste or upload your resume text content first.");
      return;
    }

    setScanning(true);
    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          jobDescription,
          resumeText,
          domain
        })
      });

      const data = await response.json();
      setAssessment(data);

      // Cache elements in localStorage for the cross-view injection bridge
      const bridgeData = {
        role,
        domain,
        resumeText,
        upscState: domain === "UPSC" ? upscState : null,
        upscElective: domain === "UPSC" ? upscElective : null,
        upscAchievements: domain === "UPSC" ? upscAchievements : null,
        strengths: data.strengths || [],
        gaps: data.gaps || [],
        timestamp: Date.now()
      };
      localStorage.setItem("scanned_resume_data", JSON.stringify(bridgeData));
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setAssessment(null);
    setFileScanningState("idle");
    setScanningProgress(0);
    setCurrentStepIdx(0);
    setUploadedFileName("");
  };

  return (
    <div className="space-y-8 p-1 animate-fade-in" id="resume-scanner-container">
      
      {/* Search Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-1000 flex items-center gap-1.5">
            <Layers className="h-4.5 w-4.5 text-blue-500" />
            AI Credentials & Profile Audit Engine
          </h2>
          <p className="text-xs text-slate-400">
            {domain === "UPSC" 
              ? "Examine your civil services Detailed Application Form (DAF) against crucial board questioning themes." 
              : "Map resume credentials relative to target corporate specifications and identify immediate blindspots."}
          </p>
        </div>

        {/* Domain Switching Quick Toggle segment */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setDomain("Standard");
              setRole("Senior Frontend Architect");
              setJobDescription("Senior UI Engineer Criteria");
              setResumeText("");
              handleReset();
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all
              ${domain === "Standard" 
                ? "bg-white text-slate-800 shadow-xs" 
                : "text-slate-500 hover:text-slate-800"}`}
          >
            Corporate & Tech
          </button>
          <button
            type="button"
            onClick={() => {
              setDomain("UPSC");
              setRole("UPSC Civil Services Candidate");
              setJobDescription("5-Member Union Public Service Commission Board Committee");
              handleReset();
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all
              ${domain === "UPSC" 
                ? "bg-[#1A2B3C] text-amber-400 shadow-xs" 
                : "text-slate-500 hover:text-slate-800"}`}
          >
            UPSC DAF Auditor
          </button>
        </div>
      </div>

      {assessment ? (
        // Results assessment Screen View
        <div id="scanner-results-container" className="space-y-8 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fit Circular Gauge */}
            <div className="bg-[#1A2B3C] text-white rounded-xl p-6 flex flex-col justify-between text-center relative overflow-hidden" id="scanner-results-gauge">
              <div className="text-left">
                <span className="bg-[#2D9CDB]/15 text-[#2D9CDB] border border-[#2D9CDB]/30 px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-bold uppercase inline-block">
                  AI Fit Rating
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5">Job Affinity Index</h3>
              </div>

              <div className="my-6 relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="50" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="50" 
                    className="stroke-[#2D9CDB] transition-all duration-1000" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={314}
                    strokeDashoffset={314 - (314 * assessment.fitScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-white">{assessment.fitScore}%</span>
                  <span className="text-[8px] text-slate-400 uppercase font-mono tracking-widest">Job Affinity</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleReset}
                  id="scanner-relaunch-btn"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2 rounded-lg text-xs leading-none transition-colors border border-slate-700 inline-flex items-center space-x-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Scan Another Resume</span>
                </button>
              </div>
            </div>

            {/* Strengths and Gaps summary */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between" id="scanner-results-summary">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credentials Audit Summary</h4>
                  <span className="bg-[#27AE60]/10 text-[#27AE60] text-xs font-bold px-2 py-0.5 rounded">
                    Senior Candidate profile Matches
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Strengths list */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">Foundational Strengths Matches</span>
                    <ul className="space-y-2">
                      {assessment.strengths?.map((str, i) => (
                        <li key={i} className="flex items-start text-slate-600 bg-emerald-50/20 border border-emerald-100 p-2.5 rounded-lg leading-snug">
                          <CheckCircle className="h-4 w-4 text-[#27AE60] mr-2 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Gaps list */}
                  <div className="space-y-2">
                    <span className="font-bold text-amber-600 uppercase text-[10px] tracking-wider block">Identified Qualification Gaps</span>
                    <ul className="space-y-2">
                      {assessment.gaps?.map((gap, i) => (
                        <li key={i} className="flex items-start text-slate-600 bg-amber-50/20 border border-amber-100 p-2.5 rounded-lg leading-snug">
                          <AlertTriangle className="h-4 w-4 text-[#F2994A] mr-2 shrink-0 mt-0.5" />
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Prepare Steps details / Bureaucratic Gap Analysis Matrix */}
          {domain === "UPSC" ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4" id="scanner-bureaucratic-matrix">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Landmark className="h-4.5 w-4.5 text-amber-600" />
                  Bureaucratic Gap Analysis Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Targeted analysis of your Detailed Application Form (DAF) profiling gaps mapped against potential grilling questions of the board and diplomatic strategy responses.
                </p>
              </div>

              <div className="overflow-x-auto overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1A2B3C] text-slate-200 uppercase text-[9px] font-mono tracking-wider">
                    <tr>
                      <th className="p-3.5 border-r border-slate-800 w-[28%]">DAF Risk Node / Gap Area</th>
                      <th className="p-3.5 border-r border-slate-800 w-[38%]">Hostile Board Counter-Question</th>
                      <th className="p-3.5">Tactful Diplomatic Defence Strategy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {assessment.gaps?.map((gap, idx) => {
                      const questionText = assessment.interviewPrepQuestions?.[idx] || "Explain why you seek to transition fields into the administrative services?";
                      const strategicDefenseText = assessment.actionPlan?.[idx] || "Demonstrate administrative parity and problem-solving systems logic.";
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 border-r border-slate-200 align-top font-bold text-slate-800">
                            <div className="flex items-start gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                              <span>{gap}</span>
                            </div>
                          </td>
                          <td className="p-3.5 border-r border-slate-200 align-top italic text-slate-700 bg-amber-50/10">
                            "{questionText}"
                          </td>
                          <td className="p-3.5 align-top text-slate-600">
                            <div className="bg-emerald-50/25 text-slate-800 p-2.5 rounded-lg border border-emerald-100/70 flex items-start gap-1.5 leading-relaxed">
                              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                              <span>{strategicDefenseText}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4" id="scanner-action-plan">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <TrendingUp className="h-4.5 w-4.5 text-[#27AE60]" />
                Tailored preparation Action roadmap
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assessment.actionPlan?.map((plan, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#2D9CDB] uppercase">Phase {i + 1} item</span>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed mt-1.5">{plan}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Targeted Prep Questions specifically for Gaps */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4" id="scanner-prep-questions">
            <div>
              <h3 className="text-sm font-bold text-slate-900 block">
                Tough Blindspot Questions Generator
              </h3>
              <p className="text-xs text-slate-400">
                These custom scenario challenges are calculated specifically to test identified candidate gaps during a real session.
              </p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/20">
              {assessment.interviewPrepQuestions?.map((q, i) => (
                <div key={i} className="p-4 flex items-start gap-3">
                  <div className="bg-[#1A2B3C] text-white h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 font-mono">
                    {i + 1}
                  </div>
                  <div className="text-xs font-semibold text-slate-800 leading-relaxed pr-4">
                    {q}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        // Input scanning setup Page View
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6" id="scanner-input-form">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Role config */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 block">
                {domain === "UPSC" ? "Civil Services Aspirant Designation" : "Target Job Position/Role"}
              </label>
              <input 
                id="target-role-input"
                type="text" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none"
                placeholder={domain === "UPSC" ? "e.g., Civil Services Aspirant" : "e.g., Senior Full Stack Developer"}
              />
            </div>

            {/* Target Job Dec config */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 block">
                {domain === "UPSC" ? "Target Board Panel Details" : "Target Job Description Criteria"}
              </label>
              <input 
                id="target-desc-input"
                type="text" 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none"
                placeholder={domain === "UPSC" ? "e.g., 5-Member UPSC Personality Board" : "Paste primary job criteria details here..."}
              />
            </div>

            {/* Conditional Rendering based on fileScanningState */}
            {fileScanningState === "idle" && (
              <>
                {/* Drag and Drop Upload field */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    {domain === "UPSC" ? "Detailed Application Form (DAF) Dossier" : "Credentials Upload"}
                  </label>
                  
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all leading-normal
                      ${dragActive 
                        ? "border-amber-500 bg-amber-50/10" 
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("resume-uploader-input")?.click()}
                    id="drag-and-drop-container"
                  >
                    <input 
                      type="file"
                      id="resume-uploader-input"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    
                    <div className={`p-3 rounded-full mb-3 ${domain === "UPSC" ? "bg-amber-100 text-amber-600" : "bg-[#2D9CDB]/10 text-[#2D9CDB]"}`}>
                      <Upload className="h-6 w-6" />
                    </div>
                    
                    <p className="text-xs font-semibold text-slate-800">
                      {domain === "UPSC" ? (
                        <>
                          Drop your Detailed Application Form (DAF) or Profile Dossier here, or <span className="text-amber-600 font-bold hover:underline">browse files</span>
                        </>
                      ) : (
                        <>
                          Drag and drop your Resume file (.pdf, .txt, .docx) here, or <span className="text-[#2D9CDB] font-bold hover:underline">browse files</span>
                        </>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Maximum upload size limit: 10MB</p>
                  </div>
                </div>

                {/* Specialized metadata preview layout below the upload card showing simulated parse tags */}
                {domain === "UPSC" && (
                  <div className="md:col-span-2 bg-amber-50/30 border border-amber-200 rounded-xl p-5 space-y-4 shadow-xs animate-fade-in" id="upsc-daf-extractor-card">
                    <div className="flex justify-between items-center pb-2 border-b border-amber-200/50">
                      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <Award className="h-4 w-4 text-amber-600" />
                        Simulated UPSC DAF Extraction Panel
                      </h4>
                      <span className="text-[9px] font-mono font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                        Parse Verified
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Home State / Cadre Preference */}
                      <div className="bg-white border border-slate-200 p-3 rounded-lg space-y-1.5 focus-within:ring-1 focus-within:ring-amber-500">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Home State / Cadre Preference</span>
                        <input 
                          type="text" 
                          value={upscState}
                          onChange={(e) => setUpscState(e.target.value)}
                          className="w-full text-xs font-bold text-slate-800 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none"
                        />
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="bg-amber-100/50 text-amber-800 px-1.5 py-0.5 rounded text-[9px] font-medium font-mono">Preferences: {upscCadre}</span>
                        </div>
                      </div>

                      {/* Academic Electives */}
                      <div className="bg-white border border-slate-200 p-3 rounded-lg space-y-1.5 focus-within:ring-1 focus-within:ring-amber-500">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Academic Electives</span>
                        <input 
                          type="text" 
                          value={upscElective}
                          onChange={(e) => setUpscElective(e.target.value)}
                          className="w-full text-xs font-bold text-slate-800 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none"
                        />
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="bg-amber-100/50 text-amber-800 px-1.5 py-0.5 rounded text-[9px] font-medium font-mono">Optional Subject</span>
                        </div>
                      </div>

                      {/* Extra-Curricular Achievements */}
                      <div className="bg-white border border-slate-200 p-3 rounded-lg space-y-1.5 focus-within:ring-1 focus-within:ring-amber-500">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Extra-Curricular Achievements</span>
                        <input 
                          type="text" 
                          value={upscAchievements}
                          onChange={(e) => setUpscAchievements(e.target.value)}
                          className="w-full text-xs font-bold text-slate-800 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none"
                        />
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="bg-amber-100/50 text-amber-800 px-1.5 py-0.5 rounded text-[9px] font-medium font-mono">Activity Dossiers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paste alternative Text field */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    {domain === "UPSC" ? "Or Paste DAF / Profile Summary Dossier Content Directly" : "Or Paste Resume Raw Text Content"}
                  </label>
                  <textarea
                    id="resume-raw-textarea"
                    rows={6}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none resize-none placeholder-slate-400 font-mono"
                    placeholder={domain === "UPSC" ? "Paste Details of DAF (State, Electives, Achievements) directly..." : "Paste the raw text of your resume or achievements directly here..."}
                  />
                </div>
              </>
            )}

            {fileScanningState === "scanning" && (
              <div className="md:col-span-2 bg-[#1A2B3C] text-white rounded-xl p-8 border border-slate-750 shadow-xl space-y-6 flex flex-col justify-center animate-fade-in" id="credentials-scanning-panel">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                      <Cpu className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-sans tracking-tight">AI Dossier Parse Core Active</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Parsing target: {uploadedFileName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#2D9CDB]">{scanningProgress}%</span>
                    <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">integrity map</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-emerald-400 h-full rounded-full transition-all duration-75"
                    style={{ width: `${scanningProgress}%` }}
                  />
                </div>

                {/* Steps checklist with dynamic animations */}
                <div className="space-y-4 pt-2">
                  {pseudoSteps.map((step, idx) => {
                    const isActive = idx === currentStepIdx;
                    const isDone = idx < currentStepIdx;
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-start justify-between p-3.5 rounded-xl border transition-all duration-300
                          ${isActive 
                            ? "bg-blue-950/25 border-blue-500/40 text-white shadow-inner" 
                            : isDone 
                              ? "bg-slate-900/30 border-slate-800/40 text-slate-300" 
                              : "bg-slate-900/10 border-slate-900/10 text-slate-600 opacity-40"}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <div className="p-1 bg-emerald-500/15 rounded-full text-emerald-400">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            ) : isActive ? (
                              <div className="p-1 bg-blue-500/15 rounded-full text-blue-400 animate-spin">
                                <RefreshCw className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <div className="p-1 bg-slate-800 rounded-full text-slate-600">
                                <div className="h-3.5 w-3.5 rounded-full border border-slate-750" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold font-sans block">{step.label}</span>
                            <span className="text-[10px] text-slate-400 leading-relaxed block">{step.desc}</span>
                          </div>
                        </div>
                        {isDone && (
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                            Parsed
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[9px] font-mono text-[#2D9CDB] bg-blue-950/30 border border-blue-900/40 px-2 py-0.5 rounded font-bold uppercase shrink-0 animate-pulse">
                            Processing
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {fileScanningState === "completed" && (
              <div className="md:col-span-2 bg-[#1A2B3C] text-white rounded-xl p-6 border border-slate-750/80 shadow-2xl space-y-6 animate-fade-in" id="credentials-completed-panel">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">AI Dossier Successfully Extracted</h4>
                      <p className="text-[11px] text-slate-400 font-mono">Profile context successfully structured for prompt gap detection</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-805 px-3 py-1.5 rounded-lg flex items-center space-x-2 shrink-0">
                    <FileCode className="h-4 w-4 text-[#2D9CDB]" />
                    <span className="text-[10px] text-slate-300 font-mono truncate max-w-[150px]">{uploadedFileName}</span>
                  </div>
                </div>

                {/* Profile Summary Card details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 space-y-4">
                    <h5 className="text-[10px] font-bold text-[#2D9CDB] uppercase tracking-wider font-mono">Extracted Target Profile</h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-lg">
                        <span className="text-[9px] text-slate-450 font-mono block uppercase">Candidate Name</span>
                        <span className="text-xs font-bold text-white mt-1 block">Praful Tharwani</span>
                      </div>
                      
                      <div className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-lg">
                        <span className="text-[9px] text-slate-450 font-mono block uppercase font-bold text-[#27AE60]">Expertise Affinity</span>
                        <span className="text-xs font-bold text-emerald-400 mt-1 block flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Senior Leader Alignment</span>
                        </span>
                      </div>

                      {domain === "UPSC" ? (
                        <>
                          <div className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-lg">
                            <span className="text-[9px] text-slate-450 font-mono block uppercase">Preferred Home State</span>
                            <span className="text-xs font-bold text-amber-400 mt-1 block">{upscState || "Chhattisgarh"}</span>
                          </div>
                          <div className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-lg">
                            <span className="text-[9px] text-slate-450 font-mono block uppercase">Assigned Optional Elective</span>
                            <span className="text-xs font-bold text-amber-400 mt-1 block">{upscElective || "Public Administration"}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-lg sm:col-span-2">
                            <span className="text-[9px] text-slate-450 font-mono block uppercase">Detected Core Attributes</span>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {["React Interface Architecture", "TypeScript Standards", "Vite Custom Bundling", "Zustand Core State", "WCAG Dynamic Audits", "CI/CD Orchestration"].map((tag, idx) => (
                                <span key={idx} className="bg-[#2D9CDB]/12 text-[#2D9CDB] text-[9px] font-mono border border-[#2D9CDB]/20 px-1.5 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Parse Integrity Metric Gauge */}
                  <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center relative">
                    <div className="absolute top-2 left-3 text-[7px] text-slate-500 font-mono uppercase tracking-wider">extraction efficiency</div>
                    
                    <div className="text-3xl font-extrabold text-emerald-400 mt-2">98.4%</div>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">High Match Integrity</span>
                    
                    <p className="text-[9px] text-slate-400 leading-normal mt-2.5">
                      All linguistic clusters identified cleanly. High similarity matrix structure detected.
                    </p>
                  </div>
                </div>

                {/* Sub-actions prompt */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <button
                    onClick={handleReset}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs px-4 py-2.5 rounded-lg border border-slate-800 flex items-center justify-center space-x-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Scan Another File</span>
                  </button>

                  <button
                    onClick={handleScanResume}
                    disabled={scanning}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-3 rounded-lg flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer select-none group"
                  >
                    {scanning ? (
                      <>
                        <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                        <span>Running AI Gap Diagnostics...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-white animate-pulse" />
                        <span>Instantly Trigger AI Resume Gap Analysis</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {fileScanningState === "idle" && (
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleScanResume}
                disabled={scanning || !resumeText.trim()}
                id="scanner-scan-submit-btn"
                className={`text-white text-xs font-semibold px-6 py-3 rounded-lg flex items-center space-x-2 shadow-sm transition-all
                  ${scanning || !resumeText.trim()
                    ? "bg-slate-200 cursor-not-allowed border-slate-200 text-slate-450" 
                    : "bg-[#1A2B3C] hover:bg-slate-800"}`}
              >
                {scanning ? (
                  <>
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                    <span>Scanning credentials file...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4.5 w-4.5 text-[#2D9CDB]" />
                    <span>Execute AI Credentials Scan</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
