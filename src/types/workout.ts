// ─── Feed ─────────────────────────────────────────────────────────────────────

export type PostType = "text" | "image" | "video" | "media";

export type PostMediaType = "image" | "video";

export interface PostMedia {
	type: PostMediaType;
	url: string;
	publicId: string;
	width?: number;
	height?: number;
}

export interface Post {
	id: string;
	userId: string;
	type: PostType;
	content: string;
	media?: PostMedia;
	createdAt: number; // Unix ms timestamp
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type MuscleGroup =
	| "chest"
	| "back"
	| "shoulders"
	| "biceps"
	| "triceps"
	| "legs"
	| "core"
	| "full_body";

export type EquipmentType = "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight" | "other";

// ─── Exercise Library ─────────────────────────────────────────────────────────

export interface Exercise {
	id: string;
	name: string;
	muscleGroup: MuscleGroup;
	equipment: EquipmentType;
	instructions?: string;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export interface TemplateSet {
	targetReps: number;
	targetWeight: number; // stored in lbs
}

export interface TemplateExercise {
	exerciseId: string;
	exerciseName: string; // denormalized — avoids joins on every render
	muscleGroup: MuscleGroup; // denormalized for display
	sets: TemplateSet[];
	restSeconds: number; // default rest timer for this exercise
}

export interface WorkoutTemplate {
	id: string;
	name: string;
	description?: string;
	exercises: TemplateExercise[];
	createdAt: number; // Unix ms timestamp
	updatedAt: number; // Unix ms timestamp
}

// ─── Active Session ───────────────────────────────────────────────────────────

export interface ActiveSet {
	targetReps: number;
	targetWeight: number;
	actualReps: number;
	actualWeight: number;
	completed: boolean;
}

export interface ActiveExercise {
	exerciseId: string;
	exerciseName: string;
	sets: ActiveSet[];
	restSeconds: number;
	notes?: string;
}

export interface ActiveWorkoutSession {
	templateId?: string;
	templateName: string;
	startedAt: number; // Unix ms timestamp
	exercises: ActiveExercise[];
}

// ─── Workout Logs (History) ───────────────────────────────────────────────────

export interface LoggedSet {
	targetReps: number;
	targetWeight: number;
	actualReps: number;
	actualWeight: number;
	completed: boolean;
	isPersonalRecord: boolean;
}

export interface LoggedExercise {
	exerciseId: string;
	exerciseName: string;
	sets: LoggedSet[];
	notes?: string;
}

export interface WorkoutLog {
	id: string;
	templateId?: string;
	templateName: string;
	startedAt: number;
	completedAt: number;
	durationSeconds: number;
	exercises: LoggedExercise[];
	totalVolumeLbs: number; // sum of (weight × reps) for all completed sets
	personalRecords: number; // count of PR sets
	notes?: string;
}
