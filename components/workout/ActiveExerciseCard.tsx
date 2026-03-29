import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { SetRow } from "@/components/workout/SetRow";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useWorkout } from "@/src/context/WorkoutContext";
import { ActiveExercise } from "@/src/types/workout";

interface Props {
	exercise: ActiveExercise;
	exerciseIdx: number;
	onSetCompleted: (restSeconds: number) => void;
}

export function ActiveExerciseCard({ exercise, exerciseIdx, onSetCompleted }: Props) {
	const { updateSet, toggleSetComplete, addSet, removeSet } = useWorkout();

	const glassCard = useThemeColor({}, "glassCard");
	const glassBorder = useThemeColor({}, "glassBorder");
	const secondaryText = useThemeColor({}, "secondaryText");
	const primary = useThemeColor({}, "primary");
	const accentTint = useThemeColor({}, "accentTint");

	function handleToggleComplete(setIdx: number) {
		const wasCompleted = exercise.sets[setIdx]?.completed;
		toggleSetComplete(exerciseIdx, setIdx);
		if (!wasCompleted) {
			onSetCompleted(exercise.restSeconds);
		}
	}

	return (
		<View
			style={[
				styles.card,
				{ backgroundColor: glassCard, borderColor: glassBorder },
			]}
		>
			{/* Left accent bar */}
			<View style={[styles.accentBar, { backgroundColor: primary }]} />

			<View style={styles.inner}>
				{/* Exercise name */}
				<ThemedText style={styles.exerciseName}>{exercise.exerciseName}</ThemedText>

				{/* Column headers */}
				<View style={styles.headerRow}>
					<ThemedText style={[styles.colHeader, styles.setCol, { color: secondaryText }]}>
						SET
					</ThemedText>
					<ThemedText style={[styles.colHeader, styles.prevCol, { color: secondaryText }]}>
						PREV
					</ThemedText>
					<ThemedText style={[styles.colHeader, styles.inputCol, { color: secondaryText }]}>
						KG
					</ThemedText>
					<ThemedText style={[styles.colHeader, styles.inputCol, { color: secondaryText }]}>
						REPS
					</ThemedText>
					<View style={styles.checkCol} />
				</View>

				{/* Set rows */}
				{exercise.sets.map((set, setIdx) => (
					<SetRow
						key={setIdx}
						set={set}
						setNumber={setIdx + 1}
						onWeightChange={(v) => updateSet(exerciseIdx, setIdx, "actualWeight", v)}
						onRepsChange={(v) => updateSet(exerciseIdx, setIdx, "actualReps", v)}
						onToggleComplete={() => handleToggleComplete(setIdx)}
						onRemove={() => {
							if (exercise.sets.length > 1) {
								removeSet(exerciseIdx, setIdx);
							}
						}}
					/>
				))}

				{/* Add set */}
				<TouchableOpacity
					style={[styles.addSetBtn, { borderColor: primary, backgroundColor: accentTint }]}
					onPress={() => addSet(exerciseIdx)}
				>
					<Ionicons name="add" size={16} color={primary} />
					<ThemedText style={[styles.addSetText, { color: primary }]}>Add Set</ThemedText>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 18,
		marginBottom: 12,
		borderWidth: 1,
		flexDirection: "row",
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 3,
	},
	accentBar: {
		width: 4,
		borderRadius: 2,
		margin: 12,
		marginRight: 0,
	},
	inner: {
		flex: 1,
		padding: 14,
		paddingLeft: 12,
	},
	exerciseName: {
		fontSize: 17,
		fontWeight: "700",
		letterSpacing: -0.3,
		marginBottom: 12,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
	},
	colHeader: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 0.8,
		textAlign: "center",
		textTransform: "uppercase",
	},
	setCol: {
		width: 36,
	},
	prevCol: {
		flex: 1.2,
	},
	inputCol: {
		flex: 1,
	},
	checkCol: {
		width: 44,
	},
	addSetBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
		paddingVertical: 10,
		marginTop: 6,
		borderRadius: 10,
		borderWidth: 1,
	},
	addSetText: {
		fontSize: 14,
		fontWeight: "600",
	},
});
