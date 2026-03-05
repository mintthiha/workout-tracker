export type SetType = "normal" | "warmup" | "dropset" | "failure";

export interface WorkoutSet {
  id: string;
  type: SetType;
  weight: string;
  reps: string;
  completed: boolean;
  previousWeight?: string;
  previousReps?: string;
}

export interface TemplateExercise {
  id: string;
  name: string;
  defaultSets: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: TemplateExercise[];
}

export interface ActiveExercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}
