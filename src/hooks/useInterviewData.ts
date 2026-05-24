import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  FirestoreError 
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { InterviewSession } from "../types/database";

// Firestore evaluation operation type mapping for error telemetry
enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Handles Firestore security and permission errors conformant to integration specifications.
 * Serializes authorization state parameters securely in a descriptive JSON payload.
 */
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Hook to stream mock interview sessions for a specific user ID in ascending order of completion dates.
 * 
 * @param userId Unique identifier of the authenticated user
 */
export function useInterviewData(userId: string) {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const pathForOnSnapshot = "sessions";
    const collectionRef = collection(db, pathForOnSnapshot);

    // Formulate a secure query filtering by owner's userId and ordering by date ascending
    const sessionsQuery = query(
      collectionRef,
      where("userId", "==", userId),
      orderBy("completedDate", "asc")
    );

    const unsubscribe = onSnapshot(
      sessionsQuery,
      (snapshot) => {
        const results: InterviewSession[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          results.push({
            sessionId: doc.id,
            userId: data.userId,
            role: data.role || "Unknown Position",
            completedDate: data.completedDate,
            scores: {
              techDepth: data.scores?.techDepth ?? 0,
              communication: data.scores?.communication ?? 0,
              problemSolving: data.scores?.problemSolving ?? 0,
              starRule: data.scores?.starRule ?? 0,
              composedIndex: data.scores?.composedIndex ?? 0,
            },
            metrics: {
              um: data.metrics?.um ?? 0,
              uh: data.metrics?.uh ?? 0,
              like: data.metrics?.like ?? 0,
              basically: data.metrics?.basically ?? 0,
              actually: data.metrics?.actually ?? 0,
            },
          });
        });
        setSessions(results);
        setLoading(false);
      },
      (error: FirestoreError) => {
        // Critical: Always handle snapshot listener failures with standard telemetry
        setLoading(false);
        handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { sessions, loading };
}
