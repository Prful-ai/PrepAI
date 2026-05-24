export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  overallReadiness: number;
  joinedAt: any; // Flexible format supporting string, Date, or Firestore Timestamp
}

export interface InterviewSession {
  sessionId: string;
  userId: string;
  role: string;
  completedDate: any; // Flexible format supporting string, Date, or Firestore Timestamp
  scores: {
    techDepth: number;
    communication: number;
    problemSolving: number;
    starRule: number;
    composedIndex: number;
  };
  metrics: {
    um: number;
    uh: number;
    like: number;
    basically: number;
    actually: number;
    [key: string]: number; // Extensible for foreign filler tokens or speech rate indices
  };
}
