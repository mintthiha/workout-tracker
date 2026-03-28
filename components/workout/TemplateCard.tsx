import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MUSCLE_GROUP_LABELS } from "@/src/data/exerciseLibrary";
import { WorkoutTemplate } from "@/src/types/workout";

const MUSCLE_GROUP_COLORS: Record<string, { bg: string; text: string }> = {
	chest: { bg: "#ffe0e0", text: "#c0392b" },
	back: { bg: "#d0f5f0", text: "#1a7a72" },
	shoulders: { bg: "#daeef9", text: "#1a6a8a" },
	biceps: { bg: "#d6f0e2", text: "#1e7a48" },
	triceps: { bg: "#fff8d6", text: "#9a7000" },
	legs: { bg: "#eedcee", text: "#7a3a8a" },
	core: { bg: "#fde8cc", text: "#9a5000" },
	full_body: { bg: "#e3e0fd", text: "#4a3aa0" },
};

const MUSCLE_GROUP_COLORS_DARK: Record<string, { bg: string; text: string }> = {
	chest: { bg: "#3a1a1a", text: "#ff8080" },
	back: { bg: "#0d2e2b", text: "#4ecdc4" },
	shoulders: { bg: "#0d2535", text: "#56b0d8" },
	biceps: { bg: "#0d2e1c", text: "#56c87e" },
	triceps: { bg: "#2e2800", text: "#ffd666" },
	legs: { bg: "#2a0f2e", text: "#c070d0" },
	core: { bg: "#2e1c00", text: "#f0a030" },
	full_body: { bg: "#1a1640", text: "#8a7eee" },
};

interface Props {
	template: WorkoutTemplate;
	onPress: () => void;
	onLongPress: () => void;
}

export function TemplateCard({ template, onPress, onLongPress }: Props) {
	const cardBg = useThemeColor({ light: "#ffffff", dark: "#1c1c1e" }, "card");
	const cardBorder = useThemeColor({ light: "#e8e8e8", dark: "#2c2c2e" }, "cardBorder");
	const secondaryText = useThemeColor({ light: "#666666", dark: "#8e8e93" }, "secondaryText");
	const accentColor = useThemeColor({ light: "#3498db", dark: "#3498db" }, "accent");
	const colorScheme = useColorScheme();
	const muscleColorMap =
		colorScheme === "dark" ? MUSCLE_GROUP_COLORS_DARK : MUSCLE_GROUP_COLORS;

	const uniqueMuscleGroups = [...new Set(template.exercises.map((e) => e.muscleGroup))];

	return (
		<TouchableOpacity
			style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
			onPress={onPress}
			onLongPress={onLongPress}
			activeOpacity={0.7}
		>
			<View style={styles.topRow}>
				<ThemedText type="defaultSemiBold" style={styles.name} numberOfLines={1}>
					{template.name}
				</ThemedText>
				<Ionicons name="chevron-forward" size={18} color={accentColor} />
			</View>

			<View style={styles.metaRow}>
				<View style={styles.exerciseCountBadge}>
					<Ionicons name="barbell-outline" size={13} color={secondaryText} />
					<ThemedText style={[styles.exerciseCountText, { color: secondaryText }]}>
						{template.exercises.length} exercise{template.exercises.length !== 1 ? "s" : ""}
					</ThemedText>
				</View>
			</View>

			{uniqueMuscleGroups.length > 0 && (
				<View style={styles.chipsRow}>
					{uniqueMuscleGroups.map((group) => {
						const colors = muscleColorMap[group] ?? {
							bg: "#e8e8e8",
							text: "#555555",
						};
						return (
							<View
								key={group}
								style={[styles.chip, { backgroundColor: colors.bg }]}
							>
								<ThemedText style={[styles.chipText, { color: colors.text }]}>
									{MUSCLE_GROUP_LABELS[group] ?? group}
								</ThemedText>
							</View>
						);
					})}
				</View>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 14,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
	},
	topRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 6,
	},
	name: {
		fontSize: 18,
		flex: 1,
		marginRight: 8,
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	exerciseCountBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	exerciseCountText: {
		fontSize: 13,
	},
	chipsRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
	},
	chip: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 20,
	},
	chipText: {
		fontSize: 12,
		fontWeight: "600",
	},
});
