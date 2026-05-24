import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { User, ActivityLog, MockSession } from "../types";
import { 
  INITIAL_DIFFICULTY, 
  INITIAL_BASELINE, 
  INITIAL_TECHS, 
  get14DefaultActivityHistory, 
  get14DefaultCompletedSessions 
} from "../utils/defaultUserData";

export function useAuthManager() {
  // 1. Centralized Auth State Machine
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    userProfile: User | null;
    loading: boolean;
  }>({
    isAuthenticated: false,
    userProfile: null,
    loading: true
  });

  // 2. User profile specific synced data fields
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(INITIAL_DIFFICULTY);
  const [baselineTarget, setBaselineTarget] = useState<number>(INITIAL_BASELINE);
  const [selectedTechStacks, setSelectedTechStacks] = useState<string[]>(INITIAL_TECHS);
  const [activityHistory, setActivityHistory] = useState<ActivityLog[]>([]);
  const [completedSessions, setCompletedSessions] = useState<MockSession[]>([]);

  // Listen for Session changes & standard Firebase triggers
  useEffect(() => {
    let storedSession = null;
    try {
      storedSession = localStorage.getItem("mock_auth_session");
    } catch (err) {
      console.error("Error accessing localStorage during auth boot:", err);
    }

    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed && typeof parsed === "object" && parsed.email) {
          setAuthState({
            isAuthenticated: true,
            userProfile: parsed,
            loading: false
          });
          return;
        }
      } catch (err) {
        console.error("Error parsing local mock session:", err);
        try {
          localStorage.removeItem("mock_auth_session");
        } catch (_) {}
      }
    }

    // Fall back to Firebase subscriber
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setAuthState({
          isAuthenticated: true,
          userProfile: {
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Auth User"
          },
          loading: false
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          userProfile: null,
          loading: false
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. User Data Syncing loop (read/write to single MockAuthUserData object scoped to user's email)
  useEffect(() => {
    if (authState.isAuthenticated && authState.userProfile) {
      const emailKey = `mock_user_data_object_${authState.userProfile.email}`;
      let storedData = null;
      try {
        storedData = localStorage.getItem(emailKey);
      } catch (err) {
        console.error("Error reading mock data from localStorage:", err);
      }
      
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          setSelectedDifficulty(parsed.difficulty || INITIAL_DIFFICULTY);
          setBaselineTarget(parsed.baselineTarget !== undefined ? parsed.baselineTarget : INITIAL_BASELINE);
          setSelectedTechStacks(parsed.selectedTechStacks || INITIAL_TECHS);
          setActivityHistory(parsed.activityHistory || get14DefaultActivityHistory(authState.userProfile.name));
          setCompletedSessions(parsed.completedSessions || get14DefaultCompletedSessions(authState.userProfile.name));
          return;
        } catch (err) {
          console.error("Error parsing stored mock user data object:", err);
        }
      }

      // Initialize brand new data object for user profile
      const fallbackHistory = get14DefaultActivityHistory(authState.userProfile.name);
      const fallbackSessions = get14DefaultCompletedSessions(authState.userProfile.name);
      
      setSelectedDifficulty(INITIAL_DIFFICULTY);
      setBaselineTarget(INITIAL_BASELINE);
      setSelectedTechStacks(INITIAL_TECHS);
      setActivityHistory(fallbackHistory);
      setCompletedSessions(fallbackSessions);

      const initialObject = {
        userProfile: authState.userProfile,
        difficulty: INITIAL_DIFFICULTY,
        baselineTarget: INITIAL_BASELINE,
        selectedTechStacks: INITIAL_TECHS,
        activityHistory: fallbackHistory,
        completedSessions: fallbackSessions
      };

      try {
        localStorage.setItem(emailKey, JSON.stringify(initialObject));
      } catch (err) {
        console.error("Error writing initial mock user data object:", err);
      }
    } else {
      // Clean slate resets
      setSelectedDifficulty(INITIAL_DIFFICULTY);
      setBaselineTarget(INITIAL_BASELINE);
      setSelectedTechStacks(INITIAL_TECHS);
      setActivityHistory([]);
      setCompletedSessions([]);
    }
  }, [authState.isAuthenticated, authState.userProfile]);

  // Safe wrapper for transactional state & storage saves
  const updateUserDataObject = (updates: Partial<{
    difficulty: string;
    baselineTarget: number;
    selectedTechStacks: string[];
    activityHistory: ActivityLog[];
    completedSessions: MockSession[];
  }>) => {
    if (!authState.isAuthenticated || !authState.userProfile) return;
    
    const emailKey = `mock_user_data_object_${authState.userProfile.email}`;
    let storedData = null;
    try {
      storedData = localStorage.getItem(emailKey);
    } catch (err) {
      console.error("Error reading custom data during transactional state update:", err);
    }

    let currentObject: any = {};
    if (storedData) {
      try {
        currentObject = JSON.parse(storedData);
      } catch (e) {
        console.error("Error parsing transactional data:", e);
      }
    }

    const updatedObject = {
      userProfile: authState.userProfile,
      difficulty: updates.difficulty !== undefined ? updates.difficulty : (currentObject.difficulty || selectedDifficulty),
      baselineTarget: updates.baselineTarget !== undefined ? updates.baselineTarget : (currentObject.baselineTarget !== undefined ? currentObject.baselineTarget : baselineTarget),
      selectedTechStacks: updates.selectedTechStacks !== undefined ? updates.selectedTechStacks : (currentObject.selectedTechStacks || selectedTechStacks),
      activityHistory: updates.activityHistory !== undefined ? updates.activityHistory : (currentObject.activityHistory || activityHistory),
      completedSessions: updates.completedSessions !== undefined ? updates.completedSessions : (currentObject.completedSessions || completedSessions)
    };

    // Propagation to React views
    if (updates.difficulty !== undefined) setSelectedDifficulty(updates.difficulty);
    if (updates.baselineTarget !== undefined) setBaselineTarget(updates.baselineTarget);
    if (updates.selectedTechStacks !== undefined) setSelectedTechStacks(updates.selectedTechStacks);
    if (updates.activityHistory !== undefined) setActivityHistory(updates.activityHistory);
    if (updates.completedSessions !== undefined) setCompletedSessions(updates.completedSessions);

    // Single object write
    try {
      localStorage.setItem(emailKey, JSON.stringify(updatedObject));
    } catch (err) {
      console.error("Error setting synchronized user object state:", err);
    }
  };

  // Add completed mock interview log with dynamic storage save triggers
  const handleAddCompletedSession = (sessionData: any) => {
    const id = `hist-${Date.now()}`;
    const newHistoryLog: ActivityLog = {
      id,
      candidateName: sessionData.candidateName,
      role: sessionData.role,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      score: sessionData.score,
      status: "Completed" as any,
      type: sessionData.type
    };

    const newSessionObject: MockSession = {
      id,
      role: sessionData.role,
      type: sessionData.type,
      difficulty: "Senior",
      date: newHistoryLog.date,
      status: "completed",
      messages: sessionData.messages,
      assessment: sessionData.assessment
    };

    const nextHistory = [newHistoryLog, ...activityHistory];
    const nextSessions = [newSessionObject, ...completedSessions];

    updateUserDataObject({
      activityHistory: nextHistory,
      completedSessions: nextSessions
    });
  };

  const handleResetUserData = () => {
    if (!authState.userProfile) return;
    const initialHistory = get14DefaultActivityHistory(authState.userProfile.name);
    const initialCompleted = get14DefaultCompletedSessions(authState.userProfile.name);
    
    updateUserDataObject({
      difficulty: INITIAL_DIFFICULTY,
      baselineTarget: INITIAL_BASELINE,
      selectedTechStacks: INITIAL_TECHS,
      activityHistory: initialHistory,
      completedSessions: initialCompleted
    });
  };

  const handleLogOut = async () => {
    try {
      localStorage.removeItem("mock_auth_session");
    } catch (err) {
      console.error("Error removing session from localStorage:", err);
    }
    
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Signout notification:", e);
    }

    setAuthState({
      isAuthenticated: false,
      userProfile: null,
      loading: false
    });
  };

  const handleAuthSuccess = (email: string, name: string) => {
    const profileObj = { email, name };
    try {
      localStorage.setItem("mock_auth_session", JSON.stringify(profileObj));
    } catch (err) {
      console.error("Error setting session cookie in safe localStorage wrapper:", err);
    }
    setAuthState({
      isAuthenticated: true,
      userProfile: profileObj,
      loading: false
    });
  };

  return {
    authState,
    selectedDifficulty,
    baselineTarget,
    selectedTechStacks,
    activityHistory,
    completedSessions,
    updateUserDataObject,
    handleAddCompletedSession,
    handleResetUserData,
    handleLogOut,
    handleAuthSuccess
  };
}
