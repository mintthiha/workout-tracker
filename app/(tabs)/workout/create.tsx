import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
	Alert,
	FlatList,
	Modal,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
	EXERCISE_LIBRARY,
	MUSCLE_GROUP_LABELS,
	MUSCLE_GROUP_ORDER,
} from "@/src/data/exerciseLibrary";
import * as workoutService from "@/src/services/workoutService";
import { Exercise, MuscleGroup, TemplateExercise } from "@/src/types/workout";

// ─── Local State Shape ────────────────────────────────────────────────────────
// Flat representation — easier to manage in UI than nested sets array.

interface ExerciseEntry {
	exerciseId: string;
	exerciseName: string;
	muscleGroup: MuscleGroup;
	setCount: number;
	defaultReps: number;
	defaultWeight: number;
	restSeconds: number;
}

function toTemplateExercise(entry: ExerciseEntry): TemplateExercise {
	return {
		exerciseId: entry.exerciseId,
		exerciseName: entry.exerciseName,
		muscleGroup: entry.muscleGroup,
		restSeconds: entry.restSeconds,
		sets: Array.from({ length: entry.setCount }, () => ({
			targetReps: entry.defaultReps,
			targetWeight: entry.defaultWeight,
		})),
	};
}

function fromTemplateExercise(te: TemplateExercise): ExerciseEntry {
	return {
		exerciseId: te.exerciseId,
		exerciseName: te.exerciseName,
		muscleGroup: te.muscleGroup,
		setCount: te.sets.length,
		defaultReps: te.sets[0]?.targetReps ?? 8,
		defaultWeight: te.sets[0]?.targetWeight ?? 0,
		restSeconds: te.restSeconds,
	};
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateTemplateScreen() {
	const { id } = useLocalSearchParams<{ id?: string }>();
	const isEditing = Boolean(id);

	const [templateName, setTemplateName] = useState("");
	const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
	const [showPicker, setShowPicker] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [saving, setSaving] = useState(false);

	// Theme colors
	const accentColor = useThemeColor({ light: "#3498db", dark: "#3498db" }, "accent");
	const cardBg = useThemeColor({ light: "#f5f5f5", dark: "#1c1c1e" }, "card");
	const cardBorder = useThemeColor({ light: "#e0e0e0", dark: "#2c2c2e" }, "cardBorder");
	const secondaryText = useThemeColor({ light: "#666666", dark: "#8e8e93" }, "secondaryText");
	const inputBg = useThemeColor({ light: "#fff", dark: "#2c2c2e" }, "card");
	const textColor = useThemeColor({ light: "#11181C", dark: "#ECEDEE" }, "text");
	const bgColor = useThemeColor({ light: "#fff", dark: "#151718" }, "background");

	// Load existing template when editing
	useEffect(() => {
		if (!id) return;
		workoutService.getTemplate(id).then((template) => {
			if (!template) return;
			setTemplateName(template.name);
			setExercises(template.exercises.map(fromTemplateExercise));
		});
	}, [id]);

	// Filtered exercise list for picker
	const filteredExercises = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		return q
			? EXERCISE_LIBRARY.filter(
					(e) =>
						e.name.toLowerCase().includes(q) ||
						MUSCLE_GROUP_LABELS[e.muscleGroup]?.toLowerCase().includes(q),
				)
			: EXERCISE_LIBRARY;
	}, [searchQuery]);

	// Grouped by muscle group for the picker
	const groupedExercises = useMemo(() => {
		const groups: { group: string; exercises: Exercise[] }[] = [];
		const grouped: Record<string, Exercise[]> = {};
		for (const ex of filteredExercises) {
			if (!grouped[ex.muscleGroup]) grouped[ex.muscleGroup] = [];
			grouped[ex.muscleGroup].push(ex);
		}
		for (const g of MUSCLE_GROUP_ORDER) {
			if (grouped[g]?.length) groups.push({ group: g, exercises: grouped[g] });
		}
		return groups;
	}, [filteredExercises]);

	function addExercise(exercise: Exercise) {
		const already = exercises.find((e) => e.exerciseId === exercise.id);
		if (already) {
			Alert.alert("Already Added", `${exercise.name} is already in this template.`);
			return;
		}
		setExercises((prev) => [
			...prev,
			{
				exerciseId: exercise.id,
				exerciseName: exercise.name,
				muscleGroup: exercise.muscleGroup,
				setCount: 3,
				defaultReps: 8,
				defaultWeight: 0,
				restSeconds: 90,
			},
		]);
		setShowPicker(false);
		setSearchQuery("");
	}

	function removeExercise(exerciseId: string) {
		setExercises((prev) => prev.filter((e) => e.exerciseId !== exerciseId));
	}

	function updateEntry(exerciseId: string, patch: Partial<ExerciseEntry>) {
		setExercises((prev) =>
			prev.map((e) => (e.exerciseId === exerciseId ? { ...e, ...patch } : e)),
		);
	}

	async function handleSave() {
		if (!templateName.trim()) {
			Alert.alert("Name Required", "Please give your template a name.");
			return;
		}
		if (exercises.length === 0) {
			Alert.alert("No Exercises", "Add at least one exercise to your template.");
			return;
		}

		setSaving(true);
		const data = {
			name: templateName.trim(),
			exercises: exercises.map(toTemplateExercise),
		};

		if (isEditing && id) {
			await workoutService.updateTemplate(id, data);
		} else {
			await workoutService.createTemplate(data);
		}
		setSaving(false);
		router.back();
	}

	return (
		<ThemedView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<ThemedText style={[styles.headerBtn, { color: accentColor }]}>
						Cancel
					</ThemedText>
				</TouchableOpacity>
				<ThemedText type="defaultSemiBold" style={styles.headerTitle}>
					{isEditing ? "Edit Template" : "New Template"}
				</ThemedText>
				<TouchableOpacity onPress={handleSave} disabled={saving}>
					<ThemedText
						style={[styles.headerBtn, { color: accentColor, fontWeight: "700" }]}
					>
						{saving ? "Saving…" : "Save"}
					</ThemedText>
				</TouchableOpacity>
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
			>
				{/* Template name input */}
				<ThemedText style={[styles.sectionLabel, { color: secondaryText }]}>
					TEMPLATE NAME
				</ThemedText>
				<TextInput
					style={[
						styles.nameInput,
						{ backgroundColor: inputBg, color: textColor, borderColor: cardBorder },
					]}
					value={templateName}
					onChangeText={setTemplateName}
					placeholder="e.g. Push Day"
					placeholderTextColor={secondaryText}
					returnKeyType="done"
				/>

				{/* Exercises */}
				<ThemedText style={[styles.sectionLabel, { color: secondaryText }]}>
					EXERCISES
				</ThemedText>

				{exercises.map((entry) => (
					<View
						key={entry.exerciseId}
						style={[
							styles.exerciseCard,
							{ backgroundColor: cardBg, borderColor: cardBorder },
						]}
					>
						<View style={styles.exerciseCardHeader}>
							<ThemedText type="defaultSemiBold" style={styles.exerciseName}>
								{entry.exerciseName}
							</ThemedText>
							<TouchableOpacity onPress={() => removeExercise(entry.exerciseId)}>
								<Ionicons name="close-circle" size={20} color={secondaryText} />
							</TouchableOpacity>
						</View>

						<ThemedText style={[styles.muscleGroupLabel, { color: secondaryText }]}>
							{MUSCLE_GROUP_LABELS[entry.muscleGroup]}
						</ThemedText>

						<View style={styles.fieldsRow}>
							<FieldStepper
								label="Sets"
								value={entry.setCount}
								min={1}
								max={10}
								onChange={(v) => updateEntry(entry.exerciseId, { setCount: v })}
								textColor={textColor}
								secondaryText={secondaryText}
							/>
							<FieldInput
								label="Reps"
								value={entry.defaultReps}
								onChange={(v) => updateEntry(entry.exerciseId, { defaultReps: v })}
								inputBg={inputBg}
								textColor={textColor}
								secondaryText={secondaryText}
								borderColor={cardBorder}
							/>
							<FieldInput
								label="Wt (lb)"
								value={entry.defaultWeight}
								onChange={(v) =>
									updateEntry(entry.exerciseId, { defaultWeight: v })
								}
								inputBg={inputBg}
								textColor={textColor}
								secondaryText={secondaryText}
								borderColor={cardBorder}
							/>
							<FieldInput
								label="Rest (s)"
								value={entry.restSeconds}
								onChange={(v) => updateEntry(entry.exerciseId, { restSeconds: v })}
								inputBg={inputBg}
								textColor={textColor}
								secondaryText={secondaryText}
								borderColor={cardBorder}
							/>
						</View>
					</View>
				))}

				<TouchableOpacity
					style={[styles.addExerciseBtn, { borderColor: accentColor }]}
					onPress={() => setShowPicker(true)}
				>
					<Ionicons name="add" size={18} color={accentColor} />
					<ThemedText style={[styles.addExerciseBtnText, { color: accentColor }]}>
						Add Exercise
					</ThemedText>
				</TouchableOpacity>

				{exercises.length > 0 && (
					<TouchableOpacity
						style={[styles.saveBtn, { backgroundColor: accentColor }]}
						onPress={handleSave}
						disabled={saving}
					>
						<ThemedText style={styles.saveBtnText}>
							{saving ? "Saving…" : isEditing ? "Update Template" : "Save Template"}
						</ThemedText>
					</TouchableOpacity>
				)}
			</ScrollView>

			{/* Exercise Picker Modal */}
			<Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet">
				<View style={[styles.pickerContainer, { backgroundColor: bgColor }]}>
					<View style={styles.pickerHeader}>
						<ThemedText type="defaultSemiBold" style={styles.pickerTitle}>
							Add Exercise
						</ThemedText>
						<TouchableOpacity
							onPress={() => {
								setShowPicker(false);
								setSearchQuery("");
							}}
						>
							<ThemedText style={{ color: accentColor }}>Done</ThemedText>
						</TouchableOpacity>
					</View>

					<TextInput
						style={[
							styles.searchInput,
							{ backgroundColor: cardBg, color: textColor, borderColor: cardBorder },
						]}
						value={searchQuery}
						onChangeText={setSearchQuery}
						placeholder="Search exercises…"
						placeholderTextColor={secondaryText}
						autoFocus
						returnKeyType="search"
					/>

					<FlatList
						data={groupedExercises}
						keyExtractor={(item) => item.group}
						renderItem={({ item }) => (
							<View>
								<ThemedText style={[styles.groupHeader, { color: secondaryText }]}>
									{MUSCLE_GROUP_LABELS[item.group]}
								</ThemedText>
								{item.exercises.map((ex) => {
									const alreadyAdded = exercises.some(
										(e) => e.exerciseId === ex.id,
									);
									return (
										<TouchableOpacity
											key={ex.id}
											style={[
												styles.pickerItem,
												{ borderBottomColor: cardBorder },
											]}
											onPress={() => addExercise(ex)}
											disabled={alreadyAdded}
										>
											<ThemedText
												style={[
													styles.pickerItemName,
													alreadyAdded && { color: secondaryText },
												]}
											>
												{ex.name}
											</ThemedText>
											{alreadyAdded && (
												<Ionicons
													name="checkmark"
													size={16}
													color={accentColor}
												/>
											)}
										</TouchableOpacity>
									);
								})}
							</View>
						)}
					/>
				</View>
			</Modal>
		</ThemedView>
	);
}

// ─── Small sub-components ─────────────────────────────────────────────────────

function FieldStepper({
	label,
	value,
	min,
	max,
	onChange,
	textColor,
	secondaryText,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	onChange: (v: number) => void;
	textColor: string;
	secondaryText: string;
}) {
	return (
		<View style={styles.fieldBox}>
			<ThemedText style={[styles.fieldLabel, { color: secondaryText }]}>{label}</ThemedText>
			<View style={styles.stepper}>
				<TouchableOpacity
					onPress={() => onChange(Math.max(min, value - 1))}
					hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
				>
					<Ionicons name="remove" size={16} color={textColor} />
				</TouchableOpacity>
				<ThemedText style={[styles.stepperValue, { color: textColor }]}>{value}</ThemedText>
				<TouchableOpacity
					onPress={() => onChange(Math.min(max, value + 1))}
					hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
				>
					<Ionicons name="add" size={16} color={textColor} />
				</TouchableOpacity>
			</View>
		</View>
	);
}

function FieldInput({
	label,
	value,
	onChange,
	inputBg,
	textColor,
	secondaryText,
	borderColor,
}: {
	label: string;
	value: number;
	onChange: (v: number) => void;
	inputBg: string;
	textColor: string;
	secondaryText: string;
	borderColor: string;
}) {
	return (
		<View style={styles.fieldBox}>
			<ThemedText style={[styles.fieldLabel, { color: secondaryText }]}>{label}</ThemedText>
			<TextInput
				style={[
					styles.fieldInput,
					{ backgroundColor: inputBg, color: textColor, borderColor },
				]}
				value={value === 0 ? "" : String(value)}
				onChangeText={(t) => {
					const n = parseInt(t, 10);
					onChange(isNaN(n) ? 0 : n);
				}}
				keyboardType="numeric"
				returnKeyType="done"
				maxLength={5}
			/>
		</View>
	);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 60,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		marginBottom: 24,
	},
	headerBtn: {
		fontSize: 17,
	},
	headerTitle: {
		fontSize: 17,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 60,
	},
	sectionLabel: {
		fontSize: 12,
		fontWeight: "600",
		letterSpacing: 0.5,
		marginBottom: 8,
		marginTop: 8,
	},
	nameInput: {
		fontSize: 16,
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderRadius: 10,
		borderWidth: 1,
		marginBottom: 24,
	},
	exerciseCard: {
		borderRadius: 12,
		padding: 14,
		marginBottom: 12,
		borderWidth: 1,
	},
	exerciseCardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 2,
	},
	exerciseName: {
		fontSize: 16,
		flex: 1,
	},
	muscleGroupLabel: {
		fontSize: 13,
		marginBottom: 12,
	},
	fieldsRow: {
		flexDirection: "row",
		gap: 10,
	},
	fieldBox: {
		flex: 1,
		alignItems: "center",
	},
	fieldLabel: {
		fontSize: 11,
		fontWeight: "600",
		marginBottom: 6,
	},
	stepper: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	stepperValue: {
		fontSize: 16,
		fontWeight: "600",
		minWidth: 20,
		textAlign: "center",
	},
	fieldInput: {
		width: "100%",
		textAlign: "center",
		fontSize: 15,
		paddingVertical: 6,
		borderRadius: 8,
		borderWidth: 1,
	},
	addExerciseBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		paddingVertical: 14,
		borderRadius: 12,
		borderWidth: 1.5,
		borderStyle: "dashed",
		marginTop: 4,
		marginBottom: 16,
	},
	addExerciseBtnText: {
		fontSize: 16,
		fontWeight: "600",
	},
	saveBtn: {
		paddingVertical: 16,
		borderRadius: 14,
		alignItems: "center",
		marginTop: 8,
	},
	saveBtnText: {
		color: "#fff",
		fontSize: 17,
		fontWeight: "700",
	},
	// Picker modal
	pickerContainer: {
		flex: 1,
		paddingTop: 20,
	},
	pickerHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		marginBottom: 16,
	},
	pickerTitle: {
		fontSize: 18,
	},
	searchInput: {
		marginHorizontal: 16,
		marginBottom: 12,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 10,
		borderWidth: 1,
		fontSize: 15,
	},
	groupHeader: {
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 0.5,
		paddingHorizontal: 20,
		paddingVertical: 8,
		textTransform: "uppercase",
	},
	pickerItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 14,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	pickerItemName: {
		fontSize: 16,
	},
});
