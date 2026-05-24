export interface ResumeMetadata {
  hometown?: string;
  homeState?: string;
  academicSubjects?: string[];
  achievements?: string[];
  techGapFrameworks?: string[];
}

const STORAGE_KEY = "scanned_resume_data";

/**
 * Persists the parsed resume metadata into localStorage.
 * @param data The ResumeMetadata object to store
 */
export function saveResumeMetadata(data: ResumeMetadata): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save resume metadata to localStorage:", error);
  }
}

/**
 * Retrieves the parsed resume metadata from localStorage.
 * @returns The ResumeMetadata object if found and successfully parsed, otherwise null
 */
export function getResumeMetadata(): ResumeMetadata | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    return JSON.parse(value) as ResumeMetadata;
  } catch (error) {
    console.error("Failed to parse resume metadata from localStorage:", error);
    return null;
  }
}

/**
 * Removes the stored resume metadata from localStorage.
 */
export function clearResumeMetadata(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear resume metadata from localStorage:", error);
  }
}

// Aliases as requested
export const save = saveResumeMetadata;
export const get = getResumeMetadata;
export const clear = clearResumeMetadata;

