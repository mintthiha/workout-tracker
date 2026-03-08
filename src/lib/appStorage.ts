import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "./userService";

// Password is excluded — never cache credentials locally.
export type CachedProfile = Omit<UserProfile, "password">;

export interface AppPreferences {
  colorScheme: "light" | "dark" | "system";
}

const DEFAULT_PREFERENCES: AppPreferences = {
  colorScheme: "system",
};

const KEYS = {
  USER_ID: "APP_USER_ID",
  USER_PROFILE: "APP_USER_PROFILE",
  PREFERENCES: "APP_PREFERENCES",
} as const;

// ─── Account ────────────────────────────────────────────────────────────────

export async function saveUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_ID, userId);
}

export async function loadUserId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.USER_ID);
}

export async function saveUserProfile(profile: CachedProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function loadUserProfile(): Promise<CachedProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return raw ? (JSON.parse(raw) as CachedProfile) : null;
}

export async function clearAccount(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.USER_ID, KEYS.USER_PROFILE]);
}

// ─── Preferences ─────────────────────────────────────────────────────────────

export async function savePreferences(prefs: AppPreferences): Promise<void> {
  await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
}

export async function loadPreferences(): Promise<AppPreferences> {
  const raw = await AsyncStorage.getItem(KEYS.PREFERENCES);
  return raw ? { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<AppPreferences>) } : DEFAULT_PREFERENCES;
}
