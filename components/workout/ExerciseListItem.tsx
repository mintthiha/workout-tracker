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
	const cardBorder = useThemeColor({ light: "#e0e0e0", dark: "#2c2c2e" }, "cardBorder");

	const firstSet = exercise.sets[0];
	const summary = firstSet
		? `${exercise.sets.length} × ${firstSet.targetReps} reps${firstSet.targetWeight > 0 ? ` @ ${firstSet.targetWeight} lb` : ""}`
		: `${exercise.sets.length} sets`;

	return (
		<View
			style={[
				styles.container,
				index > 0 && {
					borderTopWidth: StyleSheet.hairlineWidth,
					borderTopColor: cardBorder,
				},
			]}
		>
			<ThemedText type="defaultSemiBold" style={styles.name}>
				{exercise.exerciseName}
			</ThemedText>
			<ThemedText style={[styles.summary, { color: secondaryText }]}>{summary}</ThemedText>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingVertical: 12,
	},
	name: {
		fontSize: 16,
		marginBottom: 2,
	},
	summary: {
		fontSize: 14,
	},
});
