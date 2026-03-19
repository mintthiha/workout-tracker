import { useAppContext } from "@/src/context/AppContext";
import { AppPreferences } from "@/src/lib/appStorage";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";

type ColorScheme = AppPreferences["colorScheme"];

const THEME_CYCLE: ColorScheme[] = ["system", "light", "dark"];

const THEME_ICON: Record<ColorScheme, React.ComponentProps<typeof Ionicons>["name"]> = {
	system: "contrast-outline",
	light: "sunny-outline",
	dark: "moon-outline",
};

export function ThemeToggle() {
	const { preferences, updatePreferences } = useAppContext();

	function cycleTheme() {
		const next =
			THEME_CYCLE[(THEME_CYCLE.indexOf(preferences.colorScheme) + 1) % THEME_CYCLE.length];
		updatePreferences({ colorScheme: next });
	}

	return (
		<TouchableOpacity onPress={cycleTheme} style={styles.button}>
			<Ionicons name={THEME_ICON[preferences.colorScheme]} size={28} color="gray" />
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		padding: 4,
	},
});
