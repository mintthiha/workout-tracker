import AsyncStorage from "@react-native-async-storage/async-storage";
import { TimerConfig } from "./timerConstants";

const STORAGE_KEY = "TIMER_STATE";

export async function saveTimerState(config: TimerConfig): Promise<void> {
	await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function loadTimerState(): Promise<TimerConfig | null> {
	const raw = await AsyncStorage.getItem(STORAGE_KEY);
	return raw ? JSON.parse(raw) : null;
}

export async function clearTimerState(): Promise<void> {
	await AsyncStorage.removeItem(STORAGE_KEY);
}
