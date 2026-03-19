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

	const cardBg = useThemeColor({ light: "#f5f5f5", dark: "#1c1c1e" }, "card");
	const cardBorder = useThemeColor({ light: "#e0e0e0", dark: "#2c2c2e" }, "cardBorder");
	const secondaryText = useThemeColor({ light: "#666666", dark: "#8e8e93" }, "secondaryText");
	const accentColor = useThemeColor({ light: "#3498db", dark: "#3498db" }, "accent");

	function handleToggleComplete(setIdx: number) {
		const wasCompleted = exercise.sets[setIdx]?.completed;
		toggleSetComplete(exerciseIdx, setIdx);
		// Only trigger rest timer when marking as complete (not un-completing)
		if (!wasCompleted) {
			onSetCompleted(exercise.restSeconds);
		}
	}

	return (
		<View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
			{/* Exercise name */}
			<ThemedText type="defaultSemiBold" style={styles.exerciseName}>
				{exercise.exerciseName}
			</ThemedText>

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
			<TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(exerciseIdx)}>
				<Ionicons name="add" size={16} color={accentColor} />
				<ThemedText style={[styles.addSetText, { color: accentColor }]}>Add Set</ThemedText>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 12,
		padding: 14,
		marginBottom: 14,
		borderWidth: 1,
	},
	exerciseName: {
		fontSize: 17,
		marginBottom: 10,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 2,
	},
	colHeader: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.5,
		textAlign: "center",
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
		gap: 4,
		paddingVertical: 10,
		marginTop: 4,
	},
	addSetText: {
		fontSize: 14,
		fontWeight: "600",
	},
});
