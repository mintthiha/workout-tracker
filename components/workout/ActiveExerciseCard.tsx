import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { OptionItem, OptionsModal } from "@/components/ui/OptionsModal";
import { ExercisePickerSheet } from "@/components/workout/ExercisePickerSheet";
import { SetRow } from "@/components/workout/SetRow";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useWorkout } from "@/src/context/WorkoutContext";
import { ActiveExercise, Exercise } from "@/src/types/workout";

interface Props {
	exercise: ActiveExercise;
	exerciseIdx: number;
	onSetCompleted: (restSeconds: number) => void;
}

export function ActiveExerciseCard({ exercise, exerciseIdx, onSetCompleted }: Props) {
	const { updateSet, toggleSetComplete, addSet, removeSet, removeExercise, replaceExercise, setSetType, updateExerciseNote } = useWorkout();
	const [isNoteVisible, setIsNoteVisible] = useState(!!exercise.notes);
	const [showReplace, setShowReplace] = useState(false);
	const [showOptions, setShowOptions] = useState(false);
	const [showConfirmRemove, setShowConfirmRemove] = useState(false);

	const glassCard = useThemeColor({}, "glassCard");
	const glassBorder = useThemeColor({}, "glassBorder");
	const secondaryText = useThemeColor({}, "secondaryText");
	const primary = useThemeColor({}, "primary");
	const accentTint = useThemeColor({}, "accentTint");
	const danger = useThemeColor({}, "danger");
	const inputBg = useThemeColor({}, "inputBg");
	const text = useThemeColor({}, "text");

	function handleToggleComplete(setIdx: number) {
		const wasCompleted = exercise.sets[setIdx]?.completed;
		toggleSetComplete(exerciseIdx, setIdx);
		if (!wasCompleted) {
			onSetCompleted(exercise.restSeconds);
		}
	}

	function handleOptionsPress() {
		setShowOptions(true);
	}

	const EXERCISE_OPTIONS: OptionItem[] = [
		{
			id: "replace",
			label: "Replace Exercise",
			description: "Swap this out for another exercise",
			icon: "swap-horizontal",
			color: primary,
			onPress: () => setShowReplace(true),
		},
		{
			id: "note",
			label: isNoteVisible ? "Hide Note" : "Add Note",
			description: isNoteVisible ? "Remove note for this exercise" : "Add a note for this exercise",
			icon: "document-text-outline",
			color: text,
			onPress: () => setIsNoteVisible(!isNoteVisible),
		},
		{
			id: "remove",
			label: "Remove Exercise",
			description: "Delete this exercise from the workout",
			icon: "trash-outline",
			color: danger,
			onPress: () => setShowConfirmRemove(true),
		},
	];

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
				{/* Exercise name and actions */}
				<View style={styles.titleRow}>
					<ThemedText style={styles.exerciseName}>{exercise.exerciseName}</ThemedText>
					<View style={styles.actionIcons}>
						<TouchableOpacity onPress={handleOptionsPress} style={styles.iconBtn}>
							<Ionicons name="ellipsis-horizontal" size={22} color={secondaryText} />
						</TouchableOpacity>
					</View>
				</View>

				{/* Note Input */}
				{isNoteVisible && (
					<View style={styles.noteContainer}>
						<TextInput
							style={[styles.noteInput, { backgroundColor: inputBg, color: text, borderColor: glassBorder }]}
							placeholder="Add a note for this exercise..."
							placeholderTextColor={secondaryText}
							value={exercise.notes || ""}
							onChangeText={(t) => updateExerciseNote(exerciseIdx, t)}
							multiline
						/>
					</View>
				)}

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
						key={set.id}
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
						onChangeType={(type) => setSetType(exerciseIdx, setIdx, type)}
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

			<ExercisePickerSheet
				visible={showReplace}
				title="Replace Exercise"
				onSelect={(exercise: Exercise) => replaceExercise(exerciseIdx, exercise)}
				onDismiss={() => setShowReplace(false)}
			/>
			
			<OptionsModal
				visible={showOptions}
				title={exercise.exerciseName}
				subtitle="Exercise Options"
				options={EXERCISE_OPTIONS}
				onDismiss={() => setShowOptions(false)}
			/>

			<ConfirmModal
				visible={showConfirmRemove}
				onDismiss={() => setShowConfirmRemove(false)}
				icon="trash-outline"
				iconColor={danger}
				iconBg={danger + "22"}
				title="Remove Exercise?"
				body={`Are you sure you want to remove ${exercise.exerciseName} from this workout?`}
				primaryLabel="Remove"
				primaryColor={danger}
				secondaryLabel="Cancel"
				onPrimary={() => {
					setShowConfirmRemove(false);
					removeExercise(exerciseIdx);
				}}
				onSecondary={() => setShowConfirmRemove(false)}
			/>
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
	},
	titleRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	actionIcons: {
		flexDirection: "row",
		gap: 12,
	},
	iconBtn: {
		padding: 4,
	},
	noteContainer: {
		marginBottom: 12,
	},
	noteInput: {
		minHeight: 40,
		borderRadius: 10,
		borderWidth: 1,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontSize: 14,
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
