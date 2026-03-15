import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveWorkoutSession, WorkoutLog, WorkoutTemplate } from '@/src/types/workout';

// ─── Storage Keys ─────────────────────────────────────────────────────────────
// To migrate to Firebase: replace function bodies with Firestore calls.
// Function signatures stay identical — nothing else in the codebase changes.

const KEYS = {
  TEMPLATES: 'WORKOUT_TEMPLATES',
  WORKOUT_LOGS: 'WORKOUT_LOGS',
  ACTIVE_SESSION: 'WORKOUT_ACTIVE_SESSION',
} as const;

// ─── Templates ────────────────────────────────────────────────────────────────

export async function loadTemplates(): Promise<WorkoutTemplate[]> {
  const raw = await AsyncStorage.getItem(KEYS.TEMPLATES);
  return raw ? (JSON.parse(raw) as WorkoutTemplate[]) : [];
}

export async function saveTemplates(templates: WorkoutTemplate[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
}

// ─── Workout Logs ─────────────────────────────────────────────────────────────

export async function loadWorkoutLogs(): Promise<WorkoutLog[]> {
  const raw = await AsyncStorage.getItem(KEYS.WORKOUT_LOGS);
  return raw ? (JSON.parse(raw) as WorkoutLog[]) : [];
}

export async function saveWorkoutLogs(logs: WorkoutLog[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.WORKOUT_LOGS, JSON.stringify(logs));
}

// ─── Active Session ───────────────────────────────────────────────────────────
// Persists the in-progress session so a crash/backgrounding doesn't lose data.

export async function loadActiveSession(): Promise<ActiveWorkoutSession | null> {
  const raw = await AsyncStorage.getItem(KEYS.ACTIVE_SESSION);
  return raw ? (JSON.parse(raw) as ActiveWorkoutSession) : null;
}

export async function saveActiveSession(session: ActiveWorkoutSession): Promise<void> {
  await AsyncStorage.setItem(KEYS.ACTIVE_SESSION, JSON.stringify(session));
}

export async function clearActiveSession(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.ACTIVE_SESSION);
}
