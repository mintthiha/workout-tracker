import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { useAppContext } from "@/src/context/AppContext";
import * as workoutService from "@/src/services/workoutService";
import * as workoutStorage from "@/src/storage/workoutStorage";
import { ActiveSet, ActiveWorkoutSession, WorkoutLog, WorkoutTemplate } from "@/src/types/workout";

// ─── Context Shape ────────────────────────────────────────────────────────────

interface WorkoutContextValue {
	session: ActiveWorkoutSession | null;
	completedLog: WorkoutLog | null; // populated after finishWorkout(), read by workout-complete screen

	// Lifecycle
	startWorkout: (template: WorkoutTemplate) => void;
	finishWorkout: () => Promise<WorkoutLog>;
	discardWorkout: () => void;
	clearCompletedLog: () => void;

	// Set mutations — all auto-persist to storage
	updateSet: (
		exerciseIdx: number,
		setIdx: number,
		field: "actualReps" | "actualWeight",
		value: number,
	) => void;
	toggleSetComplete: (exerciseIdx: number, setIdx: number) => void;
	addSet: (exerciseIdx: number) => void;
	removeSet: (exerciseIdx: number, setIdx: number) => void;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
	const { userId } = useAppContext();
	const [session, setSession] = useState<ActiveWorkoutSession | null>(null);
	const [completedLog, setCompletedLog] = useState<WorkoutLog | null>(null);

	// Refs keep finishWorkout's closure from going stale.
	const sessionRef = useRef<ActiveWorkoutSession | null>(null);
	const userIdRef = useRef<string | null>(null);
	useEffect(() => {
		sessionRef.current = session;
	}, [session]);
	useEffect(() => {
		userIdRef.current = userId;
	}, [userId]);

	// Crash recovery: restore any persisted session on mount.
	useEffect(() => {
		workoutStorage.loadActiveSession().then((saved) => {
			if (saved) setSession(saved);
		});
	}, []);

	// ─── Internal helpers ──────────────────────────────────────────────────────

	const persist = useCallback((s: ActiveWorkoutSession) => {
		workoutStorage.saveActiveSession(s);
	}, []);

	const setAndPersist = useCallback(
		(updater: (prev: ActiveWorkoutSession) => ActiveWorkoutSession) => {
			setSession((prev) => {
				if (!prev) return prev;
				const next = updater(prev);
				persist(next);
				return next;
			});
		},
		[persist],
	);

	// ─── Lifecycle ────────────────────────────────────────────────────────────

	const startWorkout = useCallback(
		(template: WorkoutTemplate) => {
			const newSession: ActiveWorkoutSession = {
				templateId: template.id,
				templateName: template.name,
				startedAt: Date.now(),
				exercises: template.exercises.map((te) => ({
					exerciseId: te.exerciseId,
					exerciseName: te.exerciseName,
					restSeconds: te.restSeconds,
					sets: te.sets.map((s) => ({
						targetReps: s.targetReps,
						targetWeight: s.targetWeight,
						actualReps: s.targetReps,
						actualWeight: s.targetWeight,
						completed: false,
					})),
				})),
			};
			setSession(newSession);
			persist(newSession);
		},
		[persist],
	);

	const finishWorkout = useCallback(async (): Promise<WorkoutLog> => {
		const s = sessionRef.current;
		if (!s) throw new Error("No active workout session");
		const uid = userIdRef.current;
		if (!uid) throw new Error("Must be signed in to finish a workout");

		const completedAt = Date.now();
		const pastLogs = await workoutService.getWorkoutLogs(uid);

		const loggedExercises = s.exercises.map((ex) => {
			const rawSets = ex.sets.map((set) => ({ ...set, isPersonalRecord: false }));
			const setsWithPR = workoutService.detectPersonalRecords(
				ex.exerciseId,
				rawSets,
				pastLogs,
			);
			return {
				exerciseId: ex.exerciseId,
				exerciseName: ex.exerciseName,
				sets: setsWithPR,
				notes: ex.notes,
			};
		});

		const log: WorkoutLog = {
			id: workoutService.generateId(),
			templateId: s.templateId,
			templateName: s.templateName,
			startedAt: s.startedAt,
			completedAt,
			durationSeconds: Math.round((completedAt - s.startedAt) / 1000),
			exercises: loggedExercises,
			totalVolumeLbs: workoutService.calculateTotalVolume(loggedExercises),
			personalRecords: loggedExercises.reduce(
				(count, ex) => count + ex.sets.filter((set) => set.isPersonalRecord).length,
				0,
			),
		};

		await workoutService.saveWorkoutLog(uid, log);
		await workoutStorage.clearActiveSession();
		setSession(null);
		setCompletedLog(log);
		return log;
	}, []);

	const discardWorkout = useCallback(() => {
		workoutStorage.clearActiveSession();
		setSession(null);
	}, []);

	const clearCompletedLog = useCallback(() => {
		setCompletedLog(null);
	}, []);

	// ─── Set Mutations ────────────────────────────────────────────────────────

	const updateSet = useCallback(
		(
			exerciseIdx: number,
			setIdx: number,
			field: "actualReps" | "actualWeight",
			value: number,
		) => {
			setAndPersist((prev) => ({
				...prev,
				exercises: prev.exercises.map((ex, ei) =>
					ei !== exerciseIdx
						? ex
						: {
								...ex,
								sets: ex.sets.map((s, si) =>
									si !== setIdx ? s : { ...s, [field]: value },
								),
							},
				),
			}));
		},
		[setAndPersist],
	);

	const toggleSetComplete = useCallback(
		(exerciseIdx: number, setIdx: number) => {
			setAndPersist((prev) => ({
				...prev,
				exercises: prev.exercises.map((ex, ei) =>
					ei !== exerciseIdx
						? ex
						: {
								...ex,
								sets: ex.sets.map((s, si) =>
									si !== setIdx ? s : { ...s, completed: !s.completed },
								),
							},
				),
			}));
		},
		[setAndPersist],
	);

	const addSet = useCallback(
		(exerciseIdx: number) => {
			setAndPersist((prev) => ({
				...prev,
				exercises: prev.exercises.map((ex, ei) => {
					if (ei !== exerciseIdx) return ex;
					const lastSet = ex.sets[ex.sets.length - 1];
					const newSet: ActiveSet = lastSet
						? { ...lastSet, completed: false }
						: {
								targetReps: 8,
								targetWeight: 0,
								actualReps: 8,
								actualWeight: 0,
								completed: false,
							};
					return { ...ex, sets: [...ex.sets, newSet] };
				}),
			}));
		},
		[setAndPersist],
	);

	const removeSet = useCallback(
		(exerciseIdx: number, setIdx: number) => {
			setAndPersist((prev) => ({
				...prev,
				exercises: prev.exercises.map((ex, ei) =>
					ei !== exerciseIdx
						? ex
						: { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) },
				),
			}));
		},
		[setAndPersist],
	);

	// ─── Render ───────────────────────────────────────────────────────────────

	return (
		<WorkoutContext.Provider
			value={{
				session,
				completedLog,
				startWorkout,
				finishWorkout,
				discardWorkout,
				clearCompletedLog,
				updateSet,
				toggleSetComplete,
				addSet,
				removeSet,
			}}
		>
			{children}
		</WorkoutContext.Provider>
	);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkout(): WorkoutContextValue {
	const ctx = useContext(WorkoutContext);
	if (!ctx) throw new Error("useWorkout must be used within WorkoutProvider");
	return ctx;
}
