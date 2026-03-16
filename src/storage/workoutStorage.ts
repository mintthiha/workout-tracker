// ─── Workout Storage — Firestore ──────────────────────────────────────────────
// This is the ONLY file that talks to Firestore for workout data.
// All function signatures are identical to the previous AsyncStorage version —
// nothing else in the codebase (services, context, screens) changes.
//
// User scoping: reads userId from AsyncStorage (same source as AppContext).
// When Firebase Auth lands, replace loadUserId() with auth.currentUser?.uid.

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

import { db } from '@/src/lib/firebase';
import { loadUserId } from '@/src/lib/appStorage';
import { ActiveWorkoutSession, WorkoutLog, WorkoutTemplate } from '@/src/types/workout';

// ─── Internal helper ──────────────────────────────────────────────────────────

async function uid(): Promise<string> {
  const id = await loadUserId();
  if (!id) throw new Error('No user ID — complete onboarding first.');
  return id;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function loadTemplates(): Promise<WorkoutTemplate[]> {
  const userId = await uid();
  const snap = await getDocs(collection(db, 'users', userId, 'templates'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutTemplate));
}

export async function saveTemplates(templates: WorkoutTemplate[]): Promise<void> {
  const userId = await uid();
  const colRef = collection(db, 'users', userId, 'templates');

  // Diff: delete removed docs, upsert all current ones
  const existing = await getDocs(colRef);
  const existingIds = new Set(existing.docs.map((d) => d.id));
  const newIds = new Set(templates.map((t) => t.id));

  const batch = writeBatch(db);

  // Delete templates that no longer exist
  for (const existingDoc of existing.docs) {
    if (!newIds.has(existingDoc.id)) {
      batch.delete(existingDoc.ref);
    }
  }

  // Upsert all current templates (setDoc is idempotent)
  for (const template of templates) {
    batch.set(doc(colRef, template.id), template);
  }

  await batch.commit();
}

// ─── Workout Logs ─────────────────────────────────────────────────────────────

export async function loadWorkoutLogs(): Promise<WorkoutLog[]> {
  const userId = await uid();
  const snap = await getDocs(collection(db, 'users', userId, 'workoutLogs'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutLog));
}

export async function saveWorkoutLogs(newLogs: WorkoutLog[]): Promise<void> {
  const userId = await uid();
  const colRef = collection(db, 'users', userId, 'workoutLogs');

  const existing = await getDocs(colRef);
  const existingIds = new Set(existing.docs.map((d) => d.id));
  const newIds = new Set(newLogs.map((l) => l.id));

  const batch = writeBatch(db);

  // Delete logs removed from the array (e.g., user deleted a log)
  for (const existingDoc of existing.docs) {
    if (!newIds.has(existingDoc.id)) {
      batch.delete(existingDoc.ref);
    }
  }

  // Write only new logs (logs are never edited, only appended or deleted)
  for (const log of newLogs) {
    if (!existingIds.has(log.id)) {
      batch.set(doc(colRef, log.id), log);
    }
  }

  await batch.commit();
}

// ─── Active Session ───────────────────────────────────────────────────────────
// Stored as a single document at users/{uid}/meta/activeSession.
// Survives app restarts and crashes.

export async function loadActiveSession(): Promise<ActiveWorkoutSession | null> {
  const userId = await uid();
  const docRef = doc(db, 'users', userId, 'meta', 'activeSession');
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as ActiveWorkoutSession) : null;
}

export async function saveActiveSession(session: ActiveWorkoutSession): Promise<void> {
  const userId = await uid();
  await setDoc(doc(db, 'users', userId, 'meta', 'activeSession'), session);
}

export async function clearActiveSession(): Promise<void> {
  const userId = await uid();
  await deleteDoc(doc(db, 'users', userId, 'meta', 'activeSession'));
}
