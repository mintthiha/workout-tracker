import { onAuthStateChanged } from "firebase/auth";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import {
	AppPreferences,
	CachedProfile,
	clearAccount,
	clearPreferences,
	loadPreferences,
	loadUserProfile,
	savePreferences,
	saveUserProfile,
} from "../lib/appStorage";
import { auth } from "../lib/firebase";
import { getUserProfile } from "../lib/userService";

interface AppState {
	userId: string | null;
	userProfile: CachedProfile | null;
	preferences: AppPreferences;
	/** True once Firebase auth state has been resolved on startup. */
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

	// Load preferences from AsyncStorage once on startup.
	useEffect(() => {
		loadPreferences().then((preferences) => {
			setState((prev) => ({ ...prev, preferences }));
		});
	}, []);

	// Firebase auth state is the single source of truth for login state.
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				// Show cached profile immediately while fetching fresh data.
				const cached = await loadUserProfile();
				setState((prev) => ({
					...prev,
					userId: firebaseUser.uid,
					userProfile: cached,
					isLoaded: true,
				}));

				// Always sync fresh profile from Firestore.
				const fresh = await getUserProfile(firebaseUser.uid);
				if (fresh) {
					await saveUserProfile(fresh);
					setState((prev) => ({ ...prev, userProfile: fresh }));
				}
			} else {
				setState((prev) => ({ ...prev, userId: null, userProfile: null, isLoaded: true }));
			}
		});
		return unsubscribe;
	}, []);

	// Called after login/register to cache the profile locally.
	const setAccount = useCallback(async (userId: string, profile: CachedProfile) => {
		await saveUserProfile(profile);
		setState((prev) => ({ ...prev, userId, userProfile: profile }));
	}, []);

	const updatePreferences = useCallback(async (partial: Partial<AppPreferences>) => {
		setState((prev) => {
			const updated = { ...prev.preferences, ...partial };
			savePreferences(updated);
			return { ...prev, preferences: updated };
		});
	}, []);

	const handleSignOut = useCallback(async () => {
		const { signOut: authSignOut } = await import("../lib/authService");
		await authSignOut();
		await clearAccount();
		await clearPreferences();
		// onAuthStateChanged will update state to null automatically.
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
