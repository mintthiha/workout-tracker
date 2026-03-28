import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { MuscleGroupColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MUSCLE_GROUP_LABELS } from "@/src/data/exerciseLibrary";
import { TemplateExercise } from "@/src/types/workout";

interface Props {
	exercise: TemplateExercise;
	index: number;
}

export function ExerciseListItem({ exercise, index }: Props) {
	const scheme = useColorScheme();
	const muscleColorMap = MuscleGroupColors[scheme];

	const secondaryText = useThemeColor({}, "secondaryText");
	const glassDivider = useThemeColor({}, "glassDivider");
	const primary = useThemeColor({}, "primary");
	const accentTint = useThemeColor({}, "accentTint");

	const muscleColors = muscleColorMap[exercise.muscleGroup as keyof typeof muscleColorMap] ?? {
		bg: accentTint,
		text: primary,
	};

	const firstSet = exercise.sets[0];
	const setCount = exercise.sets.length;
	const summary = firstSet
		? `${setCount} × ${firstSet.targetReps} reps${firstSet.targetWeight > 0 ? ` @ ${firstSet.targetWeight} lb` : ""}`
		: `${setCount} set${setCount !== 1 ? "s" : ""}`;

	return (
		<View
			style={[
				styles.container,
				index > 0 && { borderTopWidth: 1, borderTopColor: glassDivider },
			]}
		>
			<View style={[styles.numberBadge, { backgroundColor: muscleColors.bg }]}>
				<ThemedText style={[styles.numberText, { color: muscleColors.text }]}>
					{index + 1}
				</ThemedText>
			</View>
			<View style={styles.content}>
				<ThemedText style={styles.name}>{exercise.exerciseName}</ThemedText>
				<View style={styles.metaRow}>
					<ThemedText style={[styles.muscleLabel, { color: muscleColors.text }]}>
						{MUSCLE_GROUP_LABELS[exercise.muscleGroup] ?? exercise.muscleGroup}
					</ThemedText>
					<ThemedText style={[styles.separator, { color: secondaryText }]}>·</ThemedText>
					<ThemedText style={[styles.summary, { color: secondaryText }]}>
						{summary}
					</ThemedText>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 14,
		gap: 12,
	},
	numberBadge: {
		width: 30,
		height: 30,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	numberText: {
		fontSize: 13,
		fontWeight: "700",
	},
	content: {
		flex: 1,
		gap: 3,
	},
	name: {
		fontSize: 15,
		fontWeight: "600",
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	muscleLabel: {
		fontSize: 12,
		fontWeight: "600",
	},
	separator: {
		fontSize: 12,
	},
	summary: {
		fontSize: 12,
	},
});
