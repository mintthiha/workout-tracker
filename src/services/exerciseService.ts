// ─── Exercise Service ─────────────────────────────────────────────────────────
// Reads global exercises from Firestore `exercises` collection.
// Falls back to the local bundled library if offline or Firestore is empty.
// Custom exercises are stored in AsyncStorage (swap to users/{uid}/exercises
// in Firestore once Firebase Auth is wired).

import { collection, getDocs, orderBy, query } from 'firebase/firestore';

import { EXERCISE_LIBRARY } from '@/src/data/exerciseLibrary';
import { db } from '@/src/lib/firebase';
import * as exerciseStorage from '@/src/storage/exerciseStorage';
import { Exercise, LoggedSet, WorkoutLog } from '@/src/types/workout';
import { generateId } from '@/src/services/workoutService';

// ─── Global Exercises (Firestore) ─────────────────────────────────────────────

export async function getExercises(): Promise<Exercise[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'exercises'), orderBy('name'))
    );
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Exercise));
    }
    // Firestore collection is empty (not yet seeded) — use local library
    return EXERCISE_LIBRARY;
  } catch {
    // Offline or misconfigured — fall back to bundled library
    return EXERCISE_LIBRARY;
  }
}

// ─── Custom Exercises ─────────────────────────────────────────────────────────

export async function getCustomExercises(): Promise<Exercise[]> {
  return exerciseStorage.loadCustomExercises();
}

export async function createCustomExercise(
  data: Omit<Exercise, 'id'>
): Promise<Exercise> {
  const exercises = await exerciseStorage.loadCustomExercises();
  const newExercise: Exercise = { ...data, id: `custom-${generateId()}` };
  await exerciseStorage.saveCustomExercises([...exercises, newExercise]);
  return newExercise;
}

export async function deleteCustomExercise(id: string): Promise<void> {
  const exercises = await exerciseStorage.loadCustomExercises();
  await exerciseStorage.saveCustomExercises(exercises.filter((e) => e.id !== id));
}

// ─── History helpers (derives from WorkoutLog[], no extra Firestore reads) ────

export interface ExerciseSession {
  date: number;
  sets: LoggedSet[];
  bestSet: LoggedSet | null;
  totalVolume: number;
}

export function getExerciseHistory(
  exerciseId: string,
  logs: WorkoutLog[]
): ExerciseSession[] {
  const sessions: ExerciseSession[] = [];

  for (const log of logs) {
    const found = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (!found) continue;

    const completed = found.sets.filter((s) => s.completed);
    const bestSet = completed.reduce<LoggedSet | null>((best, s) => {
      if (!best) return s;
      return s.actualWeight * s.actualReps > best.actualWeight * best.actualReps
        ? s
        : best;
    }, null);
    const totalVolume = completed.reduce(
      (sum, s) => sum + s.actualWeight * s.actualReps,
      0
    );

    sessions.push({ date: log.completedAt, sets: found.sets, bestSet, totalVolume });
  }

  // Already sorted DESC by workoutService.getWorkoutLogs()
  return sessions;
}

export function getExercisePRs(
  exerciseId: string,
  logs: WorkoutLog[]
): { bestSet: LoggedSet | null; bestVolume: number } {
  const sessions = getExerciseHistory(exerciseId, logs);
  let bestSet: LoggedSet | null = null;
  let bestVolume = 0;

  for (const session of sessions) {
    if (
      session.bestSet &&
      (!bestSet ||
        session.bestSet.actualWeight * session.bestSet.actualReps >
          bestSet.actualWeight * bestSet.actualReps)
    ) {
      bestSet = session.bestSet;
    }
    if (session.totalVolume > bestVolume) {
      bestVolume = session.totalVolume;
    }
  }

  return { bestSet, bestVolume };
}
