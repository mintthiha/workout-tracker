import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { TemplateExercise } from "@/src/types/workout";

interface Props {
	exercise: TemplateExercise;
	index: number;
}

export function ExerciseListItem({ exercise, index }: Props) {
	const secondaryText = useThemeColor({ light: "#666666", dark: "#8e8e93" }, "secondaryText");
	const cardBorder = useThemeColor({ light: "#e8e8e8", dark: "#2c2c2e" }, "cardBorder");
	const accentColor = useThemeColor({ light: "#3498db", dark: "#3498db" }, "accent");
	const badgeBg = useThemeColor({ light: "#eaf4fd", dark: "#152535" }, "card");

	const firstSet = exercise.sets[0];
	const setCount = exercise.sets.length;

	// Build compact set summary: "4 × 10 reps @ 60 lb" or "4 sets" if no data
	const summary = firstSet
		? `${setCount} × ${firstSet.targetReps} reps${firstSet.targetWeight > 0 ? ` @ ${firstSet.targetWeight} lb` : ""}`
		: `${setCount} set${setCount !== 1 ? "s" : ""}`;

	return (
		<View
			style={[
				styles.container,
				index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: cardBorder },
			]}
		>
			<View style={[styles.badge, { backgroundColor: badgeBg }]}>
				<ThemedText style={[styles.badgeText, { color: accentColor }]}>
					{index + 1}
				</ThemedText>
			</View>

			<View style={styles.content}>
				<ThemedText type="defaultSemiBold" style={styles.name}>
					{exercise.exerciseName}
				</ThemedText>
				<ThemedText style={[styles.summary, { color: secondaryText }]}>{summary}</ThemedText>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 13,
		gap: 12,
	},
	badge: {
		width: 28,
		height: 28,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	badgeText: {
		fontSize: 13,
		fontWeight: "700",
	},
	content: {
		flex: 1,
	},
	name: {
		fontSize: 16,
		marginBottom: 2,
	},
	summary: {
		fontSize: 13,
	},
});
