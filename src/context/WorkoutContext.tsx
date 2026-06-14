import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { useAppContext } from "@/src/context/AppContext";
import { AppPreferences } from "@/src/lib/appStorage";
import * as workoutService from "@/src/services/workoutService";
import * as workoutStorage from "@/src/storage/workoutStorage";
import { ActiveExercise, ActiveSet, ActiveWorkoutSession, Exercise, LoggedExercise, SetType, WorkoutLog, WorkoutTemplate } from "@/src/types/workout";

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
	setSetType: (exerciseIdx: number, setIdx: number, type: SetType) => void;
	replaceExercise: (exerciseIdx: number, newExercise: Exercise) => void;
	removeExercise: (exerciseIdx: number) => void;
	addExercise: (exercise: Exercise) => void;
	updateExerciseNote: (exerciseIdx: number, note: string) => void;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
	const { userId, preferences } = useAppContext();
	const [session, setSession] = useState<ActiveWorkoutSession | null>(null);
	const [completedLog, setCompletedLog] = useState<WorkoutLog | null>(null);

	// Refs keep finishWorkout's closure from going stale.
	const sessionRef = useRef<ActiveWorkoutSession | null>(null);
	const userIdRef = useRef<string | null>(null);
	const prefsRef = useRef<AppPreferences>(preferences);
	useEffect(() => {
		sessionRef.current = session;
	}, [session]);
	useEffect(() => {
		userIdRef.current = userId;
	}, [userId]);
	useEffect(() => {
		prefsRef.current = preferences;
	}, [preferences]);

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
					id: workoutService.generateId(),
					exerciseId: te.exerciseId,
					exerciseName: te.exerciseName,
					restSeconds: te.restSeconds,
					sets: te.sets.map((s) => ({
						id: workoutService.generateId(),
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
		const formula = prefsRef.current.oneRepMaxFormula;

		// Only keep sets with real data (actualReps > 0), auto-marking them complete.
		// Skip exercises that end up with no valid sets.
		const loggedExercises: LoggedExercise[] = s.exercises.reduce<LoggedExercise[]>(
			(acc, ex) => {
				const validSets = ex.sets
					.filter((set) => set.actualReps > 0)
					.map((set) => ({ ...set, completed: true, isPersonalRecord: false }));

				if (validSets.length === 0) return acc;

				const setsWithPR = workoutService.detectPersonalRecords(
					ex.exerciseId,
					validSets,
					pastLogs,
					formula,
				);

				const loggedEx: LoggedExercise = {
					exerciseId: ex.exerciseId,
					exerciseName: ex.exerciseName,
					sets: setsWithPR.map(s => {
						const mapped = {
							type: s.type || "normal",
							targetReps: s.targetReps,
							targetWeight: s.targetWeight,
							actualReps: s.actualReps,
							actualWeight: s.actualWeight,
							completed: s.completed,
							isPersonalRecord: s.isPersonalRecord,
							estimatedOneRepMax: s.estimatedOneRepMax,
						};
						return mapped;
					}),
				};
				// Avoid sending undefined to Firestore for optional fields
				if (ex.notes) loggedEx.notes = ex.notes;

				return [...acc, loggedEx];
			},
			[],
		);

		const log: WorkoutLog = {
			id: workoutService.generateId(),
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
		// Avoid sending undefined to Firestore for optional fields
		if (s.templateId) log.templateId = s.templateId;

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

	const setSetType = useCallback(
		(exerciseIdx: number, setIdx: number, type: SetType) => {
			setAndPersist((prev) => ({
				...prev,
				exercises: prev.exercises.map((ex, ei) =>
					ei !== exerciseIdx
						? ex
						: {
								...ex,
								sets: ex.sets.map((s, si) =>
									si !== setIdx ? s : { ...s, type },
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
						? { ...lastSet, id: workoutService.generateId(), completed: false }
						: {
								id: workoutService.generateId(),
								type: "normal",
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

	const replaceExercise = useCallback(
		(exerciseIdx: number, newExercise: Exercise, keepSets: boolean = false) => {
			setAndPersist((prev) => {
				const currentExercise = prev.exercises[exerciseIdx];
				if (!currentExercise) return prev;
				
				const updatedExercise: ActiveExercise = {
					...currentExercise,
					id: workoutService.generateId(),
					exerciseId: newExercise.id,
					exerciseName: newExercise.name,
					sets: keepSets ? currentExercise.sets : currentExercise.sets.map(s => ({
						...s,
						id: workoutService.generateId(),
						completed: false,
						actualWeight: 0,
						actualReps: 0,
					})),
				};
				
				return {
					...prev,
					exercises: prev.exercises.map((ex, ei) => 
						ei === exerciseIdx ? updatedExercise : ex
					),
				};
			});
		},
		[setAndPersist],
	);

	const addExercise = useCallback(
		(exercise: Exercise) => {
			setAndPersist((prev) => {
				const newExercise: ActiveExercise = {
					id: workoutService.generateId(),
					exerciseId: exercise.id,
					exerciseName: exercise.name,
					restSeconds: 90,
					sets: [
						{
							id: workoutService.generateId(),
							type: "normal" as SetType,
							targetReps: 0,
							targetWeight: 0,
							actualReps: 0,
							actualWeight: 0,
							completed: false,
						},
					],
				};
				return { ...prev, exercises: [...prev.exercises, newExercise] };
			});
		},
		[setAndPersist],
	);

	const removeExercise = useCallback(
		(exerciseIdx: number) => {
			setAndPersist((prev) => ({
				...prev,
				exercises: prev.exercises.filter((_, ei) => ei !== exerciseIdx),
			}));
		},
		[setAndPersist],
	);

	const updateExerciseNote = useCallback(
		(exerciseIdx: number, note: string) => {
			setAndPersist((prev) => ({
				...prev,
				exercises: prev.exercises.map((ex, ei) =>
					ei !== exerciseIdx ? ex : { ...ex, notes: note },
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
				setSetType,
				addSet,
				removeSet,
				replaceExercise,
				addExercise,
				removeExercise,
				updateExerciseNote,
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
