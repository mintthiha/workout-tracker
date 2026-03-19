import { useAppContext } from "@/src/context/AppContext";
import { useColorScheme as useSystemColorScheme } from "react-native";

/**
 * Returns the resolved color scheme ("light" or "dark").
 * Reads the user's saved preference from AppContext; falls back to the
 * system setting when the preference is "system".
 */
export function useColorScheme(): "light" | "dark" {
	const { preferences } = useAppContext();
	const system = useSystemColorScheme() ?? "light";

	if (preferences.colorScheme === "system") return system;
	return preferences.colorScheme;
}
