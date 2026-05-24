import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Helper to gracefully extract environment variables from process.env (Vite server/ssr safe)
// and fallback smoothly to import.meta.env (Vite client-side fallback)
const getEnvVar = (key: string): string => {
  let value = "";
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    value = process.env[key] as string;
  } else if (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env[key]) {
    value = (import.meta as any).env[key] as string;
  }
  
  if (value) {
    value = value.trim();
    // Strip surrounding literal double-quotes or single-quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
  }
  return value;
};

// Map standard Firebase configuration keys utilizing standard VITE_ prefixes
const firebaseConfig = {
  apiKey: getEnvVar("VITE_FIREBASE_API_KEY") || getEnvVar("VITE_API_KEY"),
  authDomain: getEnvVar("VITE_FIREBASE_AUTH_DOMAIN") || getEnvVar("VITE_AUTH_DOMAIN"),
  projectId: getEnvVar("VITE_FIREBASE_PROJECT_ID") || getEnvVar("VITE_PROJECT_ID"),
  storageBucket: getEnvVar("VITE_FIREBASE_STORAGE_BUCKET") || getEnvVar("VITE_STORAGE_BUCKET"),
  messagingSenderId: getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID") || getEnvVar("VITE_MESSAGING_SENDER_ID"),
  appId: getEnvVar("VITE_FIREBASE_APP_ID") || getEnvVar("VITE_APP_ID"),
};

// Initialize Firebase Application
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore DB constants as requested
export const auth = getAuth(app);
export const db = getFirestore(app);
