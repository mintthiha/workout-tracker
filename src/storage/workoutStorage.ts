import { ActiveWorkoutSession } from "@/src/types/workout";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Active session is kept in AsyncStorage for crash recovery only.
// Templates and workout logs are persisted in Firestore (workoutService.ts).

const ACTIVE_SESSION_KEY = "WORKOUT_ACTIVE_SESSION";

export async function loadActiveSession(): Promise<ActiveWorkoutSession | null> {
	const raw = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
	return raw ? (JSON.parse(raw) as ActiveWorkoutSession) : null;
}

export async function saveActiveSession(session: ActiveWorkoutSession): Promise<void> {
	await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
}

export async function clearActiveSession(): Promise<void> {
	await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
}
