// ─── Workout Service ──────────────────────────────────────────────────────────
// Business logic layer. Backed by Firestore, scoped to the authenticated user.
// Paths: users/{uid}/templates/{id}  and  users/{uid}/workoutLogs/{id}

import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	onSnapshot,
	orderBy,
	query,
	setDoc,
	updateDoc,
} from "firebase/firestore";

import { db } from "@/src/lib/firebase";
import { LoggedExercise, LoggedSet, WorkoutLog, WorkoutTemplate } from "@/src/types/workout";

// ─── ID Generation ────────────────────────────────────────────────────────────

export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function getTemplates(userId: string): Promise<WorkoutTemplate[]> {
	const snap = await getDocs(collection(db, "users", userId, "templates"));
	return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutTemplate));
}

export async function getTemplate(
	userId: string,
	id: string,
): Promise<WorkoutTemplate | null> {
	const snap = await getDoc(doc(db, "users", userId, "templates", id));
	if (!snap.exists()) return null;
	return { id: snap.id, ...snap.data() } as WorkoutTemplate;
}

export async function createTemplate(
	userId: string,
	data: Omit<WorkoutTemplate, "id" | "createdAt" | "updatedAt">,
): Promise<WorkoutTemplate> {
	const now = Date.now();
	const payload = { ...data, createdAt: now, updatedAt: now };
	const ref = await addDoc(collection(db, "users", userId, "templates"), payload);
	return { id: ref.id, ...payload };
}

export async function updateTemplate(
	userId: string,
	id: string,
	data: Partial<Omit<WorkoutTemplate, "id" | "createdAt">>,
): Promise<void> {
	await updateDoc(doc(db, "users", userId, "templates", id), {
		...data,
		updatedAt: Date.now(),
	});
}

export async function deleteTemplate(userId: string, id: string): Promise<void> {
	await deleteDoc(doc(db, "users", userId, "templates", id));
}

// Real-time listener — fires immediately on any create/update/delete.
// Returns an unsubscribe function; call it in useEffect cleanup.
export function subscribeToTemplates(
	userId: string,
	onData: (templates: WorkoutTemplate[]) => void,
	onError: (error: Error) => void,
): () => void {
	return onSnapshot(
		collection(db, "users", userId, "templates"),
		(snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutTemplate))),
		onError,
	);
}

export function subscribeToTemplate(
	userId: string,
	id: string,
	onData: (template: WorkoutTemplate | null) => void,
	onError: (error: Error) => void,
): () => void {
	return onSnapshot(
		doc(db, "users", userId, "templates", id),
		(snap) => onData(snap.exists() ? ({ id: snap.id, ...snap.data() } as WorkoutTemplate) : null),
		onError,
	);
}

// ─── Workout Logs ─────────────────────────────────────────────────────────────

export async function getWorkoutLogs(userId: string): Promise<WorkoutLog[]> {
	const snap = await getDocs(
		query(
			collection(db, "users", userId, "workoutLogs"),
			orderBy("completedAt", "desc"),
		),
	);
	return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutLog));
}

export async function saveWorkoutLog(userId: string, log: WorkoutLog): Promise<void> {
	const { id, ...data } = log;
	await setDoc(doc(db, "users", userId, "workoutLogs", id), data);
}

export async function deleteWorkoutLog(userId: string, id: string): Promise<void> {
	await deleteDoc(doc(db, "users", userId, "workoutLogs", id));
}

// ─── Personal Records ─────────────────────────────────────────────────────────
// Detects PRs by comparing current sets against the best historical set
// for the same exercise (using 1-rep-max equivalent: weight × reps).

export function detectPersonalRecords(
	exerciseId: string,
	sets: LoggedSet[],
	pastLogs: WorkoutLog[],
): LoggedSet[] {
	let bestPreviousVolume = 0;

	for (const log of pastLogs) {
		for (const ex of log.exercises) {
			if (ex.exerciseId !== exerciseId) continue;
			for (const s of ex.sets) {
				if (s.completed) {
					bestPreviousVolume = Math.max(
						bestPreviousVolume,
						s.actualWeight * s.actualReps,
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
				(exTotal, set) => exTotal + (set.completed ? set.actualWeight * set.actualReps : 0),
				0,
			),
		0,
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
	const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
}

export function formatMonthYear(timestamp: number): string {
	const d = new Date(timestamp);
	const months = [
		"JANUARY",
		"FEBRUARY",
		"MARCH",
		"APRIL",
		"MAY",
		"JUNE",
		"JULY",
		"AUGUST",
		"SEPTEMBER",
		"OCTOBER",
		"NOVEMBER",
		"DECEMBER",
	];
	return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function getBestSet(sets: LoggedSet[]): LoggedSet | null {
	const completed = sets.filter((s) => s.completed);
	if (completed.length === 0) return null;
	return completed.reduce((best, s) =>
		s.actualWeight * s.actualReps > best.actualWeight * best.actualReps ? s : best,
	);
}
