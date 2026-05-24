export interface User {
  email: string;
  name: string;
  uid?: string;
}

export interface SessionHistory {
  id: string;
  candidateName: string;
  role: string;
  date: string;
  score: number;
  status: 'Completed' | 'Pending Review' | 'In Progress';
  type: string;
}

export interface AppSettings {
  difficulty: string;
  baselineTarget: number;
  selectedTechStacks: string[];
}

export interface InterviewStat {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  iconName: string;
}

export interface ActivityLog {
  id: string;
  candidateName: string;
  role: string;
  date: string;
  score: number;
  status: 'Completed' | 'Pending Review' | 'In Progress';
  type: string;
}

export interface Question {
  id: string;
  question: string;
  idealAnswer: string;
  criteria: string[];
  redFlags: string[];
  difficulty: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  category: string;
}

export interface ChatMessage {
  id: string;
  sender: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
  coachTips?: string; // Real-time feedback from AI coach
}

export interface MockSession {
  id: string;
  role: string;
  type: string;
  difficulty: string;
  resumeContext?: string;
  messages: ChatMessage[];
  status: 'active' | 'completed';
  date: string;
  assessment?: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    hiringDecision: string;
    detailedFeedback: string;
    competencies: {
      technical: number;
      communication: number;
      problemSolving: number;
      culturalFit: number;
    };
  };
}

export interface ResumeAssessment {
  fitScore: number;
  matchPercentage: number;
  role: string;
  strengths: string[];
  gaps: string[];
  actionPlan: string[];
  interviewPrepQuestions: string[];
}

export interface TranscriptAssessment {
  candidateName: string;
  role: string;
  executiveSummary: string;
  competencyScores: {
    technical: number;
    communication: number;
    problemSolving: number;
    culturalFit: number;
  };
  highlights: string[];
  redFlags: string[];
  hiringDecision: 'Strong Hire' | 'Hire' | 'Borderline' | 'No Hire';
  detailedReasoning: string;
}
