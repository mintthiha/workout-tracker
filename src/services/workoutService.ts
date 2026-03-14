// ─── Workout Service ──────────────────────────────────────────────────────────
// Business logic layer. Currently backed by AsyncStorage via workoutStorage.
// To migrate to Firebase: replace workoutStorage calls with Firestore operations.
// All function signatures remain identical — nothing else in the codebase changes.

import * as workoutStorage from '@/src/storage/workoutStorage';
import { LoggedExercise, LoggedSet, WorkoutLog, WorkoutTemplate } from '@/src/types/workout';

// ─── ID Generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function getTemplates(): Promise<WorkoutTemplate[]> {
  return workoutStorage.loadTemplates();
}

export async function getTemplate(id: string): Promise<WorkoutTemplate | null> {
  const templates = await workoutStorage.loadTemplates();
  return templates.find((t) => t.id === id) ?? null;
}

export async function createTemplate(
  data: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WorkoutTemplate> {
  const templates = await workoutStorage.loadTemplates();
  const now = Date.now();
  const template: WorkoutTemplate = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  await workoutStorage.saveTemplates([...templates, template]);
  return template;
}

export async function updateTemplate(
  id: string,
  data: Partial<Omit<WorkoutTemplate, 'id' | 'createdAt'>>
): Promise<void> {
  const templates = await workoutStorage.loadTemplates();
  const updated = templates.map((t) =>
    t.id === id ? { ...t, ...data, updatedAt: Date.now() } : t
  );
  await workoutStorage.saveTemplates(updated);
}

export async function deleteTemplate(id: string): Promise<void> {
  const templates = await workoutStorage.loadTemplates();
  await workoutStorage.saveTemplates(templates.filter((t) => t.id !== id));
}

// ─── Workout Logs ─────────────────────────────────────────────────────────────

export async function getWorkoutLogs(): Promise<WorkoutLog[]> {
  const logs = await workoutStorage.loadWorkoutLogs();
  return logs.sort((a, b) => b.completedAt - a.completedAt);
}

export async function saveWorkoutLog(log: WorkoutLog): Promise<void> {
  const logs = await workoutStorage.loadWorkoutLogs();
  await workoutStorage.saveWorkoutLogs([...logs, log]);
}

export async function deleteWorkoutLog(id: string): Promise<void> {
  const logs = await workoutStorage.loadWorkoutLogs();
  await workoutStorage.saveWorkoutLogs(logs.filter((l) => l.id !== id));
}

// ─── Personal Records ─────────────────────────────────────────────────────────
// Detects PRs by comparing current sets against the best historical set
// for the same exercise (using 1-rep-max equivalent: weight × reps).

export function detectPersonalRecords(
  exerciseId: string,
  sets: LoggedSet[],
  pastLogs: WorkoutLog[]
): LoggedSet[] {
  let bestPreviousVolume = 0;

  for (const log of pastLogs) {
    for (const ex of log.exercises) {
      if (ex.exerciseId !== exerciseId) continue;
      for (const s of ex.sets) {
        if (s.completed) {
          bestPreviousVolume = Math.max(
            bestPreviousVolume,
            s.actualWeight * s.actualReps
          );
        }
      }
    }
  }

  return sets.map((set) => ({
    ...set,
    isPersonalRecord:
      set.completed &&
      set.actualWeight * set.actualReps > 0 &&
      set.actualWeight * set.actualReps > bestPreviousVolume,
  }));
}

// ─── Volume Calculation ───────────────────────────────────────────────────────

export function calculateTotalVolume(exercises: LoggedExercise[]): number {
  return exercises.reduce(
    (total, ex) =>
      total +
      ex.sets.reduce(
        (exTotal, set) =>
          exTotal + (set.completed ? set.actualWeight * set.actualReps : 0),
        0
      ),
    0
  );
}

// ─── Formatting Helpers ───────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
}

export function formatMonthYear(timestamp: number): string {
  const d = new Date(timestamp);
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function getBestSet(sets: LoggedSet[]): LoggedSet | null {
  const completed = sets.filter((s) => s.completed);
  if (completed.length === 0) return null;
  return completed.reduce((best, s) =>
    s.actualWeight * s.actualReps > best.actualWeight * best.actualReps ? s : best
  );
}
