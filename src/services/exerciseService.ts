// ─── Exercise Service ─────────────────────────────────────────────────────────
// Reads global exercises from Firestore `exercises` collection.
// Falls back to the local bundled library if offline or Firestore is empty.
// Custom exercises are stored in Firestore under users/{uid}/exercises.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';

import { EXERCISE_LIBRARY } from '@/src/data/exerciseLibrary';
import { db } from '@/src/lib/firebase';
import { Exercise, LoggedSet, WorkoutLog } from '@/src/types/workout';

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

// ─── Custom Exercises (Firestore, user-scoped) ────────────────────────────────

export async function getCustomExercises(userId: string): Promise<Exercise[]> {
  const snap = await getDocs(
    query(collection(db, 'users', userId, 'exercises'), orderBy('name'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Exercise));
}

export async function createCustomExercise(
  userId: string,
  data: Omit<Exercise, 'id'>
): Promise<Exercise> {
  const ref = await addDoc(collection(db, 'users', userId, 'exercises'), data);
  return { id: ref.id, ...data };
}

export async function deleteCustomExercise(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'exercises', id));
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
