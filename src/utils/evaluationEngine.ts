export interface FillerWordCounts {
  um: number;
  uh: number;
  like: number;
  youKnow: number;
  basically: number;
  total: number;
}

export interface CompetencyScores {
  technical: number;
  communication: number;
  problemSolving: number;
  starRules: number;
  overall: number;
}

export interface EvaluationResult {
  fillerCounts: FillerWordCounts;
  competencyScores: CompetencyScores;
  feedback: {
    strengths: string[];
    improvements: string[];
    fillerFeedback: string;
  };
  totalWords: number;
  fillerRatio: number; // percentage of fillers to total words
}

interface TranscriptEntry {
  speaker: string;
  text: string;
}

/**
 * Parses and processes a conversation transcript to extract verbal fillers and
 * calculate representative competency scores across multiple axes.
 * 
 * @param transcript Array of conversation messages containing the speaker and their response text.
 */
export function calculateSessionScores(transcript: TranscriptEntry[]): EvaluationResult {
  const fillerCounts: FillerWordCounts = {
    um: 0,
    uh: 0,
    like: 0,
    youKnow: 0,
    basically: 0,
    total: 0,
  };

  let candidateText = "";
  let totalWords = 0;

  // Aggregate candidate speech text for linguistic analysis
  transcript.forEach((entry) => {
    const isCandidate = 
      entry.speaker.toLowerCase() === "candidate" || 
      entry.speaker.toLowerCase() === "user" ||
      entry.speaker.toLowerCase() === "you";

    if (isCandidate) {
      candidateText += " " + entry.text;
    }
  });

  candidateText = candidateText.trim();

  if (candidateText) {
    // Basic word tokenization
    const words = candidateText.toLowerCase().split(/\s+/).filter(Boolean);
    totalWords = words.length;

    // Count typical filler words (using regex boundaries or word inspection to prevent substring false-positives)
    words.forEach((word) => {
      // Stripping simple punctuation from words
      const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
      
      if (cleanWord === "um") {
        fillerCounts.um++;
      } else if (cleanWord === "uh") {
        fillerCounts.uh++;
      } else if (cleanWord === "like") {
        fillerCounts.like++;
      } else if (cleanWord === "basically") {
        fillerCounts.basically++;
      }
    });

    // Special match for multi-word filler "you know"
    const lowerText = candidateText.toLowerCase();
    const youKnowMatches = lowerText.match(/\byou\s+know\b/g);
    if (youKnowMatches) {
      fillerCounts.youKnow = youKnowMatches.length;
    }
  }

  // Sum total fillers counted
  fillerCounts.total = 
    fillerCounts.um + 
    fillerCounts.uh + 
    fillerCounts.like + 
    fillerCounts.youKnow + 
    fillerCounts.basically;

  const fillerRatio = totalWords > 0 ? (fillerCounts.total / totalWords) * 100 : 0;

  // Base dynamic scoring model calibrated by filler ratios & response verbosity
  let baseScore = 80;
  
  // High filler ratios scale down communication score gracefully
  const fillerPenalty = Math.min(15, fillerRatio * 2);
  const communicationScore = Math.max(50, Math.round(90 - fillerPenalty));

  // Verbosity reward (up to limit) for technical explanations
  const technicalScore = totalWords > 300 
    ? Math.min(95, Math.round(75 + (totalWords - 300) / 25))
    : Math.max(60, Math.round(70 + totalWords / 15));

  // Balanced problem solving & STAR rules tracking based on standard candidate progression
  const problemSolvingScore = Math.min(96, Math.max(65, Math.round(82 + (totalWords > 150 ? 5 : -5))));
  const starRulesScore = Math.min(95, Math.max(60, Math.round(78 + (candidateText.includes("result") || candidateText.includes("situation") || candidateText.includes("task") ? 10 : 0))));

  const overallScore = Math.round(
    (technicalScore * 0.35) + 
    (communicationScore * 0.25) + 
    (problemSolvingScore * 0.20) + 
    (starRulesScore * 0.20)
  );

  // Generate actionable personalized text feedback blocks based on the counts
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (technicalScore >= 85) {
    strengths.push("Exhibited comprehensive technical depth with structured engineering terminology.");
  } else {
    improvements.push("Elaborate further on architectural specifications and specific package integrations.");
  }

  if (fillerCounts.total <= 3) {
    strengths.push("Highly fluent vocal delivery. Filler words were clean, minimal, and controlled.");
  } else {
    improvements.push("Focus on pausing rather than utilizing verbal crutches during conceptual transitions.");
  }

  if (candidateText.includes("result") || candidateText.includes("task") || candidateText.includes("action")) {
    strengths.push("Strong structural alignment with the STAR framework (Situation, Task, Action, Result).");
  } else {
    improvements.push("Structure answers using the STAR format, starting explicitly with high-level Situation scope.");
  }

  if (problemSolvingScore >= 85) {
    strengths.push("Clear step-by-step logic detailing system tradeoffs and active optimization rules.");
  }

  // Create filler summary feedback text helper
  let fillerFeedback = "Your voice clarity and cadence are professional.";
  if (fillerCounts.total > 10) {
    fillerFeedback = `High filler word usage detected (${fillerCounts.total} occurrences). Try practicing comfortable pauses to replace words like '${fillerCounts.um > fillerCounts.like ? "um" : "like"}' during complex thoughts.`;
  } else if (fillerCounts.total > 4) {
    fillerFeedback = `Moderate verbal filler use detected (${fillerCounts.total} counts). Solid baseline, but smoothing out phrases of '${fillerCounts.like ? "like" : "you know"}' will boost your professionalism.`;
  } else if (totalWords === 0) {
    fillerFeedback = "No candidate audio transcript recorded yet to evaluate speech verbal filler counts.";
  }

  return {
    fillerCounts,
    competencyScores: {
      technical: technicalScore,
      communication: communicationScore,
      problemSolving: problemSolvingScore,
      starRules: starRulesScore,
      overall: overallScore,
    },
    feedback: {
      strengths: strengths.length > 0 ? strengths : ["Responsive engagement established during primary prompts."],
      improvements: improvements.length > 0 ? improvements : ["Incorporate specific performance data or business impact numbers."],
      fillerFeedback,
    },
    totalWords,
    fillerRatio,
  };
}
