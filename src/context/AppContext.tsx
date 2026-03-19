import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  AppPreferences,
  CachedProfile,
  clearAccount,
  clearPreferences,
  loadPreferences,
  loadUserProfile,
  loadUserId,
  savePreferences,
  saveUserProfile,
  saveUserId,
} from "../lib/appStorage";

interface AppState {
  userId: string | null;
  userProfile: CachedProfile | null;
  preferences: AppPreferences;
  /** True once AsyncStorage has been read on startup. */
  isLoaded: boolean;
}

interface AppContextValue extends AppState {
  setAccount: (userId: string, profile: CachedProfile) => Promise<void>;
  updatePreferences: (partial: Partial<AppPreferences>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_PREFERENCES: AppPreferences = {
  colorScheme: "system",
  weightUnit: "lbs",
  defaultRestDuration: 90,
  autoStartRestTimer: false,
  timerSound: true,
  vibration: true,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    userId: null,
    userProfile: null,
    preferences: DEFAULT_PREFERENCES,
    isLoaded: false,
  });

  // Load all stored data once on startup.
  useEffect(() => {
    async function load() {
      const [userId, userProfile, preferences] = await Promise.all([
        loadUserId(),
        loadUserProfile(),
        loadPreferences(),
      ]);
      setState({ userId, userProfile, preferences, isLoaded: true });
    }
    load();
  }, []);

  const setAccount = useCallback(
    async (userId: string, profile: CachedProfile) => {
      await Promise.all([saveUserId(userId), saveUserProfile(profile)]);
      setState((prev) => ({ ...prev, userId, userProfile: profile }));
    },
    []
  );

  const updatePreferences = useCallback(
    async (partial: Partial<AppPreferences>) => {
      setState((prev) => {
        const updated = { ...prev.preferences, ...partial };
        savePreferences(updated);
        return { ...prev, preferences: updated };
      });
    },
    []
  );

  const handleSignOut = useCallback(async () => {
    const { signOut: authSignOut } = await import("../lib/authService");
    await authSignOut();
    await clearAccount();
    await clearPreferences();
    setState((prev) => ({ ...prev, userId: null, userProfile: null }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setAccount,
        updatePreferences,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
