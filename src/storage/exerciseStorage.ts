import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise } from '@/src/types/workout';

// Custom exercises only — global exercises live in Firestore and are never
// written from the client. When Firebase Auth lands, scope custom exercises
// to users/{uid}/exercises in Firestore; swap only this file.

const KEYS = {
  CUSTOM_EXERCISES: 'CUSTOM_EXERCISES',
} as const;

export async function loadCustomExercises(): Promise<Exercise[]> {
  const raw = await AsyncStorage.getItem(KEYS.CUSTOM_EXERCISES);
  return raw ? (JSON.parse(raw) as Exercise[]) : [];
}

export async function saveCustomExercises(exercises: Exercise[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.CUSTOM_EXERCISES, JSON.stringify(exercises));
}
