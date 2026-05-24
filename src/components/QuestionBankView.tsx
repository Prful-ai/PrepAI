import React, { useState } from "react";
import { 
  FileQuestion, 
  Plus, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Sparkles, 
  Trash2, 
  FileText, 
  CheckCircle, 
  X,
  AlertTriangle,
  RefreshCw,
  Search,
  Lightbulb,
  BookOpen,
  Check,
  Bookmark,
  Layers,
  Info
} from "lucide-react";
import { Question } from "../types";

interface Flashcard {
  id: string;
  category: "Frontend Engineering" | "System Design" | "Behavioral Frameworks";
  question: string;
  hint: string;
  difficulty: string;
  criteria: string[];
  idealAnswer: string;
}

const STATIC_FLASHCARDS: Flashcard[] = [
  // Frontend Engineering
  {
    id: "fc-fe-1",
    category: "Frontend Engineering",
    question: "How do you handle concurrent state synchronization and race conditions when multiple dynamic search queries resolve out of order in React?",
    hint: "Use AbortController cleanup in useEffect or track a dynamic request counter inside a mutable ref.",
    difficulty: "Senior Lead",
    criteria: [
      "Leverages AbortController for active request cancellation",
      "Uses cleanups in useEffect to bypass state setting on unmount",
      "Discusses useTransition or useDeferredValue behavior"
    ],
    idealAnswer: "The optimal design implements an abstraction layer where each network request is bound to an active AbortController created within a useEffect cycle. The cleanup function immediately calls controller.abort() when inputs mutate. Alternatively, track current request IDs via standard React refs, dismissing response inputs that fail to align with the latest count."
  },
  {
    id: "fc-fe-2",
    category: "Frontend Engineering",
    question: "How does the React 18/19 Fiber Scheduler prioritize updates, and what differentiates Phase 1 (Reconciliation) from Phase 2 (Commit)?",
    hint: "Phase 1 is interruptible and runs multiple times; Phase 2 is synchronous and writes directly to the DOM.",
    difficulty: "Staff Architect",
    criteria: [
      "Explains cooperative multitasking via Scheduler lanes",
      "Differentiates interruptible reconciliation from synchronous commit",
      "Correctly identifies side-effect hooks execution lifecycle"
    ],
    idealAnswer: "Phase 1 (Render) generates a side-effect list for the Fiber tree, doing heavy visual calculation in an interruptible loop mapped to Lane priorities. Phase 2 (Commit) locks the UI, writing those updates to the DOM in a single synchronous pass. This separation allows Concurrent React to suspend rendering to process more critical interactions."
  },
  {
    id: "fc-fe-3",
    category: "Frontend Engineering",
    question: "What strategies optimize safe Micro-Frontend state sharing without introducing hard compile-time bundle dependencies?",
    hint: "Think about custom global events, shared window observable stores, or module federation import maps.",
    difficulty: "Senior Lead",
    criteria: [
      "Proposes Custom Events or native browser pub/sub mechanisms",
      "Suggests decoupling via import maps and shared package singletons",
      "Highlights strict cleanup of event listeners to avoid memory leaks"
    ],
    idealAnswer: "To share state without code Coupling, leverage native Custom Events with unified event signatures dispatched on the global window. For complex state management, use dynamic runtime loaders (like Module Federation) to export a shared Zustand/Redux slice as a singleton, resolving dependencies cleanly at the CDN layer."
  },

  // System Design
  {
    id: "fc-sd-1",
    category: "System Design",
    question: "What design constraints and mitigation patterns prevent Cache Stampedes under sudden, extreme web-scale traffic spikes?",
    hint: "Look into mutual exclusion locking, probabilistic early expiration (XFetch), or dynamic background-cron pre-warming.",
    difficulty: "Staff Architect",
    criteria: [
      "Implements single-flight locks (e.g. singleflight in Go or Redis lock) to query DB once",
      "Utilizes probabilistic early expiration algorithms (XFetch) for cache warming",
      "Applies background queue refreshing with stale-while-revalidate mechanics"
    ],
    idealAnswer: "To solve the 'thundering herd' pattern, implement mutual exclusion (mutex) locks where only the first cache-miss client acquires the fetch lock, leading subsequent request lines to await or consume staler caches. You can also deploy the XFetch formula to calculate probabilistic early regeneration prior to absolute TTL expiry."
  },
  {
    id: "fc-sd-2",
    category: "System Design",
    question: "How do you design an ultra-low latency real-time collaborative document sync engine with concurrent editing for 1,000+ active users?",
    hint: "Compare Operational Transformation (OT) versus Conflict-free Replicated Data Types (CRDTs) like Yjs or Automerge.",
    difficulty: "Principal Architect",
    criteria: [
      "Compares centralized authority (OT) with decentralized commutativity (CRDT)",
      "Recommends viewport chunking or delta-compression payload models",
      "Addresses scale constraints via Redis pub/sub and distributed WebSockets"
    ],
    idealAnswer: "A CRDT structure (such as Yjs) should be chosen to allow commutative and associative operations on locally-replicated document states, bypassing heavy centralized server lock-steps. To handle 1,000+ simultaneous clients, partition editor fields into localized focus blocks, sending minimal JSON-delta changes over clustered WebSockets with Redis pub/sub brokers."
  },
  {
    id: "fc-sd-3",
    category: "System Design",
    question: "How would you architect a distributed Rate Limiter operating at the Edge API Gateway handling 1M+ requests per second?",
    hint: "Consider sliding window counter algorithms backed by distributed memory grids, with localized in-memory fallbacks.",
    difficulty: "Senior Architect",
    criteria: [
      "Selects sliding window counter or token bucket model with Redis",
      "Applies network latency optimizations using pipelined Redis Lua scripts",
      "Implements fail-open configuration to ensure client experience stability"
    ],
    idealAnswer: "Deploy a distributed sliding window counter in Redis with pipelined Lua scripts for atomic increments. To eliminate remote latency, cache the rate-limits at the edge gateway node for 1-2 seconds dynamically, and configure a secure 'fail-open' mechanism to allow core traffic if Redis encounters outages."
  },

  // Behavioral Frameworks
  {
    id: "fc-be-1",
    category: "Behavioral Frameworks",
    question: "How do you handle product-milestone pressure when standard engineering refactoring conflicts with strict short-term delivery?",
    hint: "Structure your narrative with STAR. Emphasize tracking actual metrics (technical debt index / feature delivery speed).",
    difficulty: "Senior Lead",
    criteria: [
      "Quantifies key risks associated with refactoring postponement",
      "Proposes incremental refactoring integrated gracefully into user story logs",
      "Maintains direct, blameless communications with non-technical business leaders"
    ],
    idealAnswer: "Formulate the refactoring work not as aesthetic layout cleanups, but as a direct mitigation against future product delivery slow-downs (KPI: developer velocity). Map refactoring into small, task-sized subcomponents, and bundle those into consecutive sprint iterations so feature deliverables are sustained continuously."
  },
  {
    id: "fc-be-2",
    category: "Behavioral Frameworks",
    question: "If a junior engineer deploys an incorrect credentials schema causing a high-priority production outage, how do you direct the post-mortem?",
    hint: "Keep it entirely blameless. Analyze systemic software gates and deployment pipelines over single human error.",
    difficulty: "Senior Lead",
    criteria: [
      "Establishes a blameless discussion context centered on process robustness",
      "Identifies lack of pipeline validations or failure isolation layers",
      "Introduces concrete automated gates (canary deployment, automated dry runs)"
    ],
    idealAnswer: "A high-performance engineering culture avoids blaming individual actions for catastrophic outcomes. During the post-mortem, steer focus to why the underlying infrastructure allowed a bad configuration to reach production. We then implement automated schema checks, sandboxed dry-runs, and instant canary rollback triggers."
  },
  {
    id: "fc-be-3",
    category: "Behavioral Frameworks",
    question: "How would you handle a major middle-of-project strategic pivot where executive leadership requests a total change in core database components?",
    hint: "Adopt an objective, modular mindset. Present data-backed migration schedules and isolate core domain components under adapters.",
    difficulty: "Staff Architect",
    criteria: [
      "Proposes architecture isolation using abstract Repository patterns",
      "Performs structured risk analysis and cost-benefit breakdowns",
      "Coaches and motivates the technical squad through the fatigue"
    ],
    idealAnswer: "Analyze the root business drivers for this abrupt shift and capture the functional scope immediately. Create a dynamic translation facade (Repository Interface patterns) to isolate database implementations from core application models. Present leadership with a clear, incremental schema migration schedule to mitigate downstream risk."
  }
];

export default function QuestionBankView() {
  const [viewMode, setViewMode] = useState<"flashcards" | "generator">("flashcards");
  const [activeCategory, setActiveCategory] = useState<"Frontend Engineering" | "System Design" | "Behavioral Frameworks">("Frontend Engineering");
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [revealedHintId, setRevealedHintId] = useState<string | null>(null);

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleHint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedHintId(revealedHintId === id ? null : id);
  };

  // Local storage backup for mastery stats
  const [masteryStates, setMasteryStates] = useState<Record<string, "mastered" | "review">>(() => {
    try {
      const stored = localStorage.getItem("qb_flashcard_progress");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [domain, setDomain] = useState("React Core & UI Engineering");
  const [difficulty, setDifficulty] = useState("Senior");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Local saved list state
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([
    {
      id: "sav-1",
      question: "Describe the core difference in reactivity and batching between React 18, React 19, and solid-state alternatives.",
      idealAnswer: "React uses a virtual DOM scheduler with fibers and automated state batching inside asynchronous promises. Solid-state frameworks instead compile layouts directly to localized granular subscriber nodes, bypassing reconciliations entirely.",
      criteria: ["Contrasts VDOM reconciliations against fine-grained compilation", "Mentions state automatic batching", "Explains runtime overhead differences"],
      redFlags: ["Thinks React compiles down to bare metal", "Cannot explain fiber reconciliation"],
      difficulty: "Senior",
      category: "React Core & UI Engineering"
    }
  ]);

  const handleUpdateMastery = (cardId: string, state: "mastered" | "review") => {
    const updated = { ...masteryStates, [cardId]: state };
    setMasteryStates(updated);
    try {
      localStorage.setItem("qb_flashcard_progress", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Request questions from Gemini endpoint
  const handleGenerateQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, difficulty })
      });

      const data = await response.json();
      
      // Inject temporary unique IDs
      const mapped: Question[] = (data.questions || []).map((q: any, index: number) => ({
        id: `q-${Date.now()}-${index}`,
        ...q
      }));

      setQuestions(mapped);
      if (mapped.length > 0) {
        setExpandedId(mapped[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleRevealAnswer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSaveQuestion = (q: Question, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedQuestions.some(item => item.question === q.question)) {
      alert("This question is already saved to your preparation list.");
      return;
    }
    setSavedQuestions(prev => [q, ...prev]);
  };

  const handleSaveFlashcardToDeck = (fc: Flashcard, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedQuestions.some(item => item.question === fc.question)) {
      alert("This question is already saved to your study deck.");
      return;
    }
    const mapped: Question = {
      id: `fc-saved-${fc.id}`,
      question: fc.question,
      idealAnswer: fc.idealAnswer,
      criteria: fc.criteria,
      redFlags: ["Lacks structural response metrics", "Misses crucial architectural trade-offs"],
      difficulty: "Senior",
      category: fc.category
    };
    setSavedQuestions(prev => [mapped, ...prev]);
  };

  const handleDeleteSaved = (id: string) => {
    setSavedQuestions(prev => prev.filter(item => item.id !== id));
  };

  const filteredSaved = savedQuestions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic filter lists
  const currentCategoryFlashcards = STATIC_FLASHCARDS.filter(fc => fc.category === activeCategory);
  const masteredInCategory = currentCategoryFlashcards.filter(fc => masteryStates[fc.id] === "mastered").length;
  const reviewInCategory = currentCategoryFlashcards.filter(fc => masteryStates[fc.id] === "review").length;
  const categoryMasteryRate = currentCategoryFlashcards.length > 0 
    ? Math.round((masteredInCategory / currentCategoryFlashcards.length) * 100) 
    : 0;

  // Global flashcard progress
  const totalGlobalCards = STATIC_FLASHCARDS.length;
  const masteredGlobalCount = STATIC_FLASHCARDS.filter(fc => masteryStates[fc.id] === "mastered").length;
  const globalCompletionRate = Math.round((masteredGlobalCount / totalGlobalCards) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-1 animate-fade-in" id="question-bank-container">
      {/* Styles Injection block for robust 3D flipping in interactive layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        .flashcard-perspective {
          perspective: 1000px;
        }
        .flashcard-preserve {
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .flashcard-backface {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .flashcard-flipped {
          transform: rotateY(180deg);
        }
      `}} />

      {/* Generator Column */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Dynamic Navigation Mode Switcher */}
        <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm flex" id="qb-view-mode-tabs">
          <button
            onClick={() => setViewMode("flashcards")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg text-center transition-all cursor-pointer flex items-center justify-center space-x-2
              ${viewMode === "flashcards" 
                ? "bg-[#1A2B3C] text-white shadow" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Interactive Active Flashcard Board</span>
          </button>
          
          <button
            onClick={() => setViewMode("generator")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg text-center transition-all cursor-pointer flex items-center justify-center space-x-2
              ${viewMode === "generator" 
                ? "bg-[#1A2B3C] text-white shadow" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Dynamic Custom Generator</span>
          </button>
        </div>

        {/* View Mode 1: Specialist Interactive Flashcards */}
        {viewMode === "flashcards" && (
          <div className="space-y-6" id="interactive-flashcard-board">
            
            {/* Category Navigation Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm" id="fc-category-selector-nav">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono shrink-0">
                ACTIVE COHORT MODULE:
              </span>
              
              <div className="flex flex-wrap gap-1.5 flex-1 justify-end">
                {(["Frontend Engineering", "System Design", "Behavioral Frameworks"] as const).map(cat => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        // Reset flipped states for clean UX
                        setFlippedCards({});
                        setRevealedHintId(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer duration-205 border
                        ${isActive 
                          ? "bg-[#2D9CDB] border-[#2D9CDB] text-white shadow-sm" 
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preparation Statistics Dashboard Widget */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow" id="fc-progression-stats-panel">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest font-mono text-[#2D9CDB]">Category Focus: {activeCategory}</h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-2xl font-extrabold font-mono text-white">{categoryMasteryRate}%</span>
                    <span className="text-xs text-slate-400">Readiness Rate ({masteredInCategory} / {currentCategoryFlashcards.length} Mastered)</span>
                  </div>
                </div>

                <div className="w-full sm:w-1/3 space-y-2 text-right">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-widest text-slate-405">
                    <span>Global Deck Completion</span>
                    <span className="font-bold text-emerald-400">{masteredGlobalCount}/{totalGlobalCards} Done</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${globalCompletionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Flashcard Item Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="fc-cards-deck-grid">
              {currentCategoryFlashcards.map(fc => {
                const isFlipped = flippedCards[fc.id] || false;
                const mastery = masteryStates[fc.id] || null;
                const hintVisible = revealedHintId === fc.id;

                return (
                  <div 
                    key={fc.id}
                    id={`flashcard-container-${fc.id}`}
                    className="flashcard-perspective h-[380px] w-full relative group cursor-pointer"
                    onClick={() => toggleFlip(fc.id)}
                  >
                    {/* The 3D Flipping Container */}
                    <div className={`w-full h-full flashcard-preserve relative rounded-2xl shadow-sm border ${isFlipped ? "flashcard-flipped" : ""} 
                      ${mastery === "mastered" 
                        ? "border-emerald-200/80 bg-emerald-50/10" 
                        : mastery === "review" 
                          ? "border-amber-200/85 bg-amber-50/10" 
                          : "border-slate-200 bg-white"}`}
                    >
                      
                      {/* ----------------- FRONT SIDE ----------------- */}
                      <div className="absolute inset-0 w-full h-full flashcard-backface p-6 flex flex-col justify-between rounded-2xl z-10">
                        {/* Header Details */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-1.5">
                            <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[9px] font-mono font-bold">
                              {fc.category}
                            </span>
                          </div>
                          <span className="bg-[#2D9CDB]/11 text-[#2D9CDB] border border-[#2D9CDB]/20 px-2 py-0.5 rounded text-[9px] font-mono tracking-tight font-bold">
                            {fc.difficulty}
                          </span>
                        </div>

                        {/* Centered Targeted Technical Question */}
                        <div className="flex-1 flex flex-col justify-center py-4 space-y-3">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#2D9CDB] font-extrabold block">Technical Question Prompt</span>
                          <h4 className="text-sm font-bold text-slate-850 leading-relaxed tracking-tight">
                            {fc.question}
                          </h4>
                        </div>

                        {/* Interactive Tooltip & Action Switch Footer */}
                        <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between relative mt-auto">
                          {/* Reveal Hint Tooltip */}
                          <div className="relative">
                            <button
                              onClick={(e) => toggleHint(fc.id, e)}
                              className="px-2.5 py-1.5 bg-slate-50 hover:bg-[#2D9CDB]/10 hover:text-[#2D9CDB] border border-slate-205 rounded-lg text-[10px] font-extrabold font-mono tracking-wide text-slate-500 flex items-center gap-1 transition-all"
                              title="Toggle helper clue hint"
                            >
                              <Lightbulb className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                              <span>REVEAL HINT</span>
                            </button>

                            {/* Hint Tooltip Bubble popup */}
                            {hintVisible && (
                              <div 
                                className="absolute bottom-10 left-0 bg-slate-900 text-slate-100 text-[10px] leading-relaxed p-3.5 rounded-lg shadow-xl z-50 border border-slate-750 max-w-[240px] animate-fade-in font-sans"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="font-bold text-amber-400 mb-1 flex items-center gap-1 uppercase tracking-wider font-mono">
                                  <Lightbulb className="h-3 w-3" />
                                  <span>Clue Hint Insight:</span>
                                </div>
                                {fc.hint}
                                <button 
                                  onClick={(e) => toggleHint(fc.id, e)} 
                                  className="absolute top-1 right-1 text-slate-400 hover:text-white p-0.5"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider animate-pulse flex items-center gap-1">
                            <span>Flip to Answer</span>
                            <ChevronDown className="h-3 w-3 rotate-270" />
                          </span>
                        </div>
                      </div>

                      {/* ----------------- BACK SIDE ----------------- */}
                      <div className="absolute inset-0 w-full h-full flashcard-backface p-5 flex flex-col justify-between rounded-2xl rotate-y-180 bg-slate-50/90 overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                          <span className="text-[9px] font-mono font-bold text-[#2D9CDB] uppercase tracking-wider">ASSESSMENT ARCHITECTURAL CRITERIA</span>
                          <button
                            onClick={(e) => handleSaveFlashcardToDeck(fc, e)}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#2D9CDB] transition-all"
                            title="Save reference question to your Study Deck"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Evaluation Checklist criteria grid */}
                        <div className="space-y-2 flex-1">
                          <span className="text-[8.5px] font-mono font-bold text-slate-450 uppercase block tracking-wider">evaluation checkpoints</span>
                          <div className="grid grid-cols-1 gap-1.5 mb-2">
                            {fc.criteria.map((crt, index) => (
                              <div key={index} className="bg-white border border-slate-150 rounded p-1.5 text-[10px] text-slate-700 flex items-start gap-1">
                                <CheckCircle className="h-3 w-3 text-[#27AE60] mt-0.5 shrink-0" />
                                <span className="leading-tight">{crt}</span>
                              </div>
                            ))}
                          </div>

                          {/* Optimal Architectural Answer summary */}
                          <div className="bg-white rounded p-2.5 border border-slate-150 overflow-y-auto max-h-[110px]">
                            <span className="text-[8px] font-mono font-bold text-[#2D9CDB] uppercase block tracking-wider mb-1">Target AI Paradigm</span>
                            <p className="text-[10px] text-slate-600 leading-normal italic">
                              "{fc.idealAnswer}"
                            </p>
                          </div>
                        </div>

                        {/* Binary checklist Button and Flip back trigger */}
                        <div className="border-t border-slate-200/80 pt-2.5 mt-auto flex flex-col space-y-2 select-none">
                          <div className="flex gap-2">
                            {/* Mastered Option */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateMastery(fc.id, "mastered");
                              }}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase font-mono border tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1
                                ${mastery === "mastered"
                                  ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"}`}
                            >
                              <Check className="h-3 w-3" />
                              <span>Mastered</span>
                            </button>

                            {/* Review Later Option */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateMastery(fc.id, "review");
                              }}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase font-mono border tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1
                                ${mastery === "review"
                                  ? "bg-amber-500 border-amber-500 text-white shadow-xs"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700"}`}
                            >
                              <AlertTriangle className="h-3 w-3" />
                              <span>Review Later</span>
                            </button>
                          </div>

                          <div className="text-center">
                            <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 font-mono hover:text-[#2D9CDB] transition-all">
                              Click back of card to flip return
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View Mode 2: Custom AI Generator */}
        {viewMode === "generator" && (
          <div className="space-y-6" id="ai-generator-panel">
            {/* Domain selection card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FileQuestion className="h-4.5 w-4.5 text-[#2D9CDB]" />
                  AI Technical Question Generator
                </h3>
                <p className="text-xs text-slate-500">
                  Query our Gemini engine to compile a set of tailored technical and behavioral questions designed for professional testing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Interview Tech Specialty Domain</label>
                  <select
                    id="qb-domain-select"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-lg text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-[#2D9CDB] focus:bg-white"
                  >
                    <option value="React Core & UI Engineering">React Core (Hooks, Context, Fiber Scheduler, Suspense)</option>
                    <option value="Advanced JavaScript & TypeScript spec">Advanced JS/TS (Event loops, Closures, Currying, Generics)</option>
                    <option value="System Design & Cloud scaling architecture">System Design (Load balancers, Caching systems, WebSockets)</option>
                    <option value="STAR Behavioral & Conflict methodologies">STAR Behavioral (Conflict resolutions, Project setbacks)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Competency Difficulty Level</label>
                  <select
                    id="qb-difficulty-select"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-lg text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-[#2D9CDB] focus:bg-white"
                  >
                    <option value="Entry / Graduate">Entry-level / Graduate</option>
                    <option value="Mid-Level">Mid-Level Tech Specialist</option>
                    <option value="Senior">Senior Lead</option>
                    <option value="Staff / Principal Architect">Staff / Principal Architect</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleGenerateQuestions}
                  disabled={loading}
                  id="qb-generate-btn"
                  className="bg-[#1A2B3C] hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm transition-all"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                      <span>Generating Question Set...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4.5 w-4.5 text-[#2D9CDB]" />
                      <span>Generate Questions</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List of generated questions */}
            {questions.length > 0 ? (
              <div className="space-y-4" id="qb-questions-list">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    COMPREHENSIVE QUESTIONS ({questions.length})
                  </h4>
                </div>

                {questions.map((q) => {
                  const isExpanded = expandedId === q.id;
                  const isRevealed = revealedAnswers[q.id];
                  return (
                    <div 
                      key={q.id}
                      id={`qb-question-card-${q.id}`}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
                      onClick={() => toggleExpand(q.id)}
                    >
                      <div className="p-5 flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[9px] font-mono tracking-tight">
                              {q.category}
                            </span>
                            <span className="bg-[#2D9CDB]/10 text-[#2D9CDB] px-2 py-0.5 rounded text-[9px] font-mono tracking-tight font-bold">
                              {q.difficulty}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-855 leading-snug">
                            {q.question}
                          </h4>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => handleSaveQuestion(q, e)}
                            id={`qb-save-question-${q.id}`}
                            className="bg-slate-50 border border-slate-200 hover:bg-[#2D9CDB]/10 hover:text-[#2D9CDB] p-2 rounded-lg text-slate-400 transition-colors"
                            title="Add to study deck"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button className="text-slate-400">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded block drawer details */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs animate-slide-up">
                          
                          {/* Criteria */}
                          <div className="space-y-1.5">
                            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">Evaluation criteria benchmarks</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {q.criteria?.map((c, idx) => (
                                <div key={idx} className="bg-white border border-slate-150 rounded px-3 py-1.5 text-slate-600 flex items-start gap-1">
                                  <CheckCircle className="h-3.5 w-3.5 text-[#27AE60] mt-0.5 shrink-0" />
                                  <span>{c}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Warnings / Red flags */}
                          <div className="space-y-1.5">
                            <span className="font-bold text-[#F2994A] uppercase text-[10px] tracking-wider block">Candidate Red Flags to flag</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {q.redFlags?.map((rf, idx) => (
                                <div key={idx} className="bg-amber-50/50 border border-amber-200/50 rounded px-3 py-1.5 text-slate-600 flex items-start gap-1">
                                  <AlertTriangle className="h-3.5 w-3.5 text-[#F2994A] mt-0.5 shrink-0" />
                                  <span>{rf}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Revealed answer Block */}
                          <div className="pt-2">
                            <button
                              onClick={(e) => toggleRevealAnswer(q.id, e)}
                              id={`revealer-id-${q.id}`}
                              className="text-[#2D9CDB] hover:text-[#1a8bc9] font-semibold text-xs flex items-center space-x-1"
                            >
                              <span>{isRevealed ? "Hide Ideal Answer Matrix" : "Reveal Ideal Answer Matrix"}</span>
                            </button>

                            {isRevealed && (
                              <div className="mt-3 bg-white border border-slate-200 p-4 rounded-xl text-slate-700 leading-relaxed max-w-2xl animate-fade-in whitespace-pre-line">
                                {q.idealAnswer || "No target template provided."}
                              </div>
                            )}
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 space-y-2">
                <FileQuestion className="h-8 w-8 text-slate-300" />
                <h4 className="text-xs font-bold text-slate-600 font-sans">No Dynamic Questions Generated Yet</h4>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  Select a technology specialty domain and difficulty level from above, then trigger a prompt evaluation generation block.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Saved preparing questions Drawer Column */}
      <div className="space-y-6">
        <div className="bg-[#1A2B3C] text-white border border-slate-800 rounded-xl p-5 shadow-sm space-y-4" id="qb-study-deck">
          <div>
            <h3 className="text-xs font-mono font-bold tracking-widest text-[#2D9CDB] uppercase">MY STUDY PREP DECK</h3>
            <p className="text-xs text-slate-300 mt-1">
              Add technical questions from your AI triggers here to study offline.
            </p>
          </div>

          {/* Prep search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search saved deck..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs placeholder-slate-400 text-white focus:outline-none focus:ring-1 focus:ring-[#2D9CDB]"
            />
          </div>

          <div className="space-y-3.5 max-h-[100vh-20rem] overflow-y-auto pr-2">
            {filteredSaved.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                You haven't saved any preparation cards yet. Add cards!
              </div>
            ) : (
              filteredSaved.map((item) => (
                <div 
                  key={item.id} 
                  id={`saved-card-${item.id}`}
                  className="bg-slate-850/50 border border-slate-805 p-3 rounded-lg relative group transition-colors hover:bg-slate-800/40"
                >
                  <div className="space-y-1.5 pr-6">
                    <div className="flex items-center space-x-1 text-[9px] font-mono">
                      <span className="text-[#2D9CDB] font-semibold">{item.difficulty}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400 truncate max-w-32">{item.category}</span>
                    </div>
                    <p className="text-xs text-slate-200 font-semibold leading-normal">{item.question}</p>
                    
                    <details className="text-[11px] text-slate-350 pt-2 block cursor-pointer">
                      <summary className="font-semibold text-slate-300 hover:text-white pb-1 focus:outline-none select-none">Reveal Answer Matrix</summary>
                      <p className="border-t border-slate-800 pt-2 text-slate-300 whitespace-pre-line leading-relaxed">{item.idealAnswer}</p>
                    </details>
                  </div>

                  <button
                    onClick={() => handleDeleteSaved(item.id)}
                    id={`deleted-key-${item.id}`}
                    className="absolute right-2 top-2 text-slate-500 hover:text-red-400 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
