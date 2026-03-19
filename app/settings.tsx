import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryCard } from "@/components/settings/CategoryCard";
import { SettingRow } from "@/components/settings/SettingRow";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAppContext } from "@/src/context/AppContext";
import type { AppPreferences, RestDuration, WeightUnit } from "@/src/lib/appStorage";

type Category = "appearance" | "workouts" | "notifications";

const REST_DURATION_OPTIONS: { label: string; value: RestDuration }[] = [
	{ label: "30s", value: 30 },
	{ label: "60s", value: 60 },
	{ label: "90s", value: 90 },
	{ label: "2m", value: 120 },
	{ label: "3m", value: 180 },
	{ label: "5m", value: 300 },
];

const THEME_OPTIONS: { label: string; value: AppPreferences["colorScheme"] }[] = [
	{ label: "System", value: "system" },
	{ label: "Light", value: "light" },
	{ label: "Dark", value: "dark" },
];

const WEIGHT_OPTIONS: { label: string; value: WeightUnit }[] = [
	{ label: "Pounds (lbs)", value: "lbs" },
	{ label: "Kilograms (kg)", value: "kg" },
];

export default function SettingsScreen() {
	const router = useRouter();
	const { preferences, updatePreferences } = useAppContext();
	const [activeCategory, setActiveCategory] = useState<Category | null>(null);
	const iconColor = useThemeColor({}, "icon");
	const textColor = useThemeColor({}, "text");

	function handleBack() {
		if (activeCategory) {
			setActiveCategory(null);
		} else {
			router.back();
		}
	}

	const title = activeCategory
		? activeCategory === "appearance"
			? "Appearance"
			: activeCategory === "workouts"
				? "Workouts"
				: "Notifications"
		: "Settings";

	return (
		<ThemedView style={{ flex: 1 }}>
			<SafeAreaView style={{ flex: 1 }}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity onPress={handleBack} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color={textColor} />
					</TouchableOpacity>
					<ThemedText type="title" style={styles.headerTitle}>
						{title}
					</ThemedText>
					<View style={styles.backButton} />
				</View>

				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					{activeCategory === null && <CategoriesView onSelect={setActiveCategory} />}
					{activeCategory === "appearance" && (
						<AppearanceSettings
							preferences={preferences}
							onUpdate={updatePreferences}
						/>
					)}
					{activeCategory === "workouts" && (
						<WorkoutSettings preferences={preferences} onUpdate={updatePreferences} />
					)}
					{activeCategory === "notifications" && (
						<NotificationSettings
							preferences={preferences}
							onUpdate={updatePreferences}
						/>
					)}
				</ScrollView>
			</SafeAreaView>
		</ThemedView>
	);
}

function CategoriesView({ onSelect }: { onSelect: (cat: Category) => void }) {
	return (
		<View>
			<CategoryCard
				icon="color-palette-outline"
				title="Appearance"
				subtitle="Theme and display preferences"
				onPress={() => onSelect("appearance")}
			/>
			<CategoryCard
				icon="barbell-outline"
				title="Workouts"
				subtitle="Units, rest timer, and workout behavior"
				onPress={() => onSelect("workouts")}
			/>
			<CategoryCard
				icon="notifications-outline"
				title="Notifications"
				subtitle="Sound and haptic feedback"
				onPress={() => onSelect("notifications")}
			/>
		</View>
	);
}

function AppearanceSettings({
	preferences,
	onUpdate,
}: {
	preferences: AppPreferences;
	onUpdate: (partial: Partial<AppPreferences>) => void;
}) {
	return (
		<View>
			<ThemedText style={styles.sectionLabel}>THEME</ThemedText>
			<SettingRow
				type="select"
				label="Application Theme"
				description="Choose your preferred color scheme"
				value={preferences.colorScheme}
				options={THEME_OPTIONS}
				onValueChange={(v) => onUpdate({ colorScheme: v })}
			/>
		</View>
	);
}

function WorkoutSettings({
	preferences,
	onUpdate,
}: {
	preferences: AppPreferences;
	onUpdate: (partial: Partial<AppPreferences>) => void;
}) {
	return (
		<View>
			<ThemedText style={styles.sectionLabel}>UNITS</ThemedText>
			<SettingRow
				type="select"
				label="Weight Units"
				description="Unit used for logging weights"
				value={preferences.weightUnit}
				options={WEIGHT_OPTIONS}
				onValueChange={(v) => onUpdate({ weightUnit: v })}
			/>

			<ThemedText style={styles.sectionLabel}>REST TIMER</ThemedText>
			<SettingRow
				type="select"
				label="Default Rest Duration"
				description="Pre-filled rest time between sets"
				value={preferences.defaultRestDuration}
				options={REST_DURATION_OPTIONS}
				onValueChange={(v) => onUpdate({ defaultRestDuration: v })}
			/>
			<SettingRow
				type="toggle"
				label="Auto-Start Rest Timer"
				description="Start timer automatically after completing a set"
				value={preferences.autoStartRestTimer}
				onValueChange={(v) => onUpdate({ autoStartRestTimer: v })}
			/>
		</View>
	);
}

function NotificationSettings({
	preferences,
	onUpdate,
}: {
	preferences: AppPreferences;
	onUpdate: (partial: Partial<AppPreferences>) => void;
}) {
	return (
		<View>
			<ThemedText style={styles.sectionLabel}>ALERTS</ThemedText>
			<SettingRow
				type="toggle"
				label="Timer Sound"
				description="Play a sound when the rest timer completes"
				value={preferences.timerSound}
				onValueChange={(v) => onUpdate({ timerSound: v })}
			/>
			<SettingRow
				type="toggle"
				label="Vibration"
				description="Vibrate on timer completion and key actions"
				value={preferences.vibration}
				onValueChange={(v) => onUpdate({ vibration: v })}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 8,
	},
	backButton: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "700",
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 16,
		paddingBottom: 40,
	},
	sectionLabel: {
		fontSize: 12,
		fontWeight: "600",
		letterSpacing: 1,
		opacity: 0.5,
		marginBottom: 8,
		marginTop: 8,
		marginLeft: 4,
	},
});
