import { WorkoutTemplate } from "../types/workout";

export const MOCK_EXERCISES = [
  { id: "1", name: "Bench Press (Barbell)" },
  { id: "2", name: "Squat (Barbell)" },
  { id: "3", name: "Deadlift (Barbell)" },
  { id: "4", name: "Pull Up" },
  { id: "5", name: "Overhead Press (Barbell)" },
  { id: "6", name: "Row (Barbell)" },
  { id: "7", name: "Bicep Curl (Dumbbell)" },
  { id: "8", name: "Tricep Pushdown (Cable)" },
  { id: "9", name: "Leg Press" },
  { id: "10", name: "Lat Pulldown (Cable)" },
  { id: "11", name: "Romanian Deadlift" },
  { id: "12", name: "Incline Bench Press (Dumbbell)" },
];

export const INITIAL_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "1",
    name: "Push Day",
    exercises: [
      { id: "1", name: "Bench Press (Barbell)", defaultSets: 4 },
      { id: "5", name: "Overhead Press (Barbell)", defaultSets: 3 },
      { id: "12", name: "Incline Bench Press (Dumbbell)", defaultSets: 3 },
      { id: "8", name: "Tricep Pushdown (Cable)", defaultSets: 3 },
    ],
  },
  {
    id: "2",
    name: "Pull Day",
    exercises: [
      { id: "4", name: "Pull Up", defaultSets: 4 },
      { id: "10", name: "Lat Pulldown (Cable)", defaultSets: 3 },
      { id: "6", name: "Row (Barbell)", defaultSets: 3 },
      { id: "7", name: "Bicep Curl (Dumbbell)", defaultSets: 3 },
    ],
  },
  {
    id: "3",
    name: "Leg Day",
    exercises: [
      { id: "2", name: "Squat (Barbell)", defaultSets: 4 },
      { id: "9", name: "Leg Press", defaultSets: 3 },
      { id: "11", name: "Romanian Deadlift", defaultSets: 3 },
      { id: "3", name: "Deadlift (Barbell)", defaultSets: 3 },
    ],
  },
];
