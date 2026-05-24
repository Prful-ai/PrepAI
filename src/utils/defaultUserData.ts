import { ActivityLog, MockSession } from "../types";

export interface UserProfile {
  email: string;
  name: string;
}

export interface MockAuthUserData {
  userProfile: UserProfile;
  difficulty: string;
  baselineTarget: number;
  selectedTechStacks: string[];
  activityHistory: ActivityLog[];
  completedSessions: MockSession[];
}

export const INITIAL_TECHS = ["Frontend", "System Design"];
export const INITIAL_DIFFICULTY = "Mid-Level Engineer";
export const INITIAL_BASELINE = 80;

// The default session history initializes completely empty
export const defaultSessionHistory: ActivityLog[] = [];

// Fleshing out empty detailed history logs, initializing completely empty
export const get14DefaultActivityHistory = (candidateName: string): ActivityLog[] => [];

// Fleshing out empty completed sessions, initializing completely empty
export const get14DefaultCompletedSessions = (candidateName: string): MockSession[] => [];
