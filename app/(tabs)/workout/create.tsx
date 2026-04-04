import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Modal,
	ScrollView,
	SectionList,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MuscleGroupColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAppContext } from "@/src/context/AppContext";
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ORDER } from "@/src/data/exerciseLibrary";
import * as exerciseService from "@/src/services/exerciseService";
import * as workoutService from "@/src/services/workoutService";
import { Exercise, MuscleGroup, TemplateExercise } from "@/src/types/workout";

// ─── Local State Shape ────────────────────────────────────────────────────────

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
	const params = useLocalSearchParams<{ id?: string }>();
	const id = Array.isArray(params.id) ? params.id[0] : params.id;
	const { userId, isLoaded } = useAppContext();
	const isEditing = Boolean(id);

	const [templateName, setTemplateName] = useState("");
	const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
	const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
	const [loadingExercises, setLoadingExercises] = useState(true);
	const [showPicker, setShowPicker] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | null>(null);
	const [saving, setSaving] = useState(false);

	const primary = useThemeColor({}, "primary");
	const glassCard = useThemeColor({}, "glassCard");
	const glassBorder = useThemeColor({}, "glassBorder");
	const glassDivider = useThemeColor({}, "glassDivider");
	const secondaryText = useThemeColor({}, "secondaryText");
	const tertiaryText = useThemeColor({}, "tertiaryText");
	const textColor = useThemeColor({}, "text");
	const background = useThemeColor({}, "background");
	const accentTint = useThemeColor({}, "accentTint");

	useEffect(() => {
		if (!userId) return;
		Promise.all([
			exerciseService.getExercises(),
			exerciseService.getCustomExercises(userId),
		])
			.then(([global, custom]) => setAvailableExercises([...global, ...custom]))
			.finally(() => setLoadingExercises(false));
	}, [userId]);

	useEffect(() => {
		if (!id || !userId) return;
		workoutService.getTemplate(userId, id).then((template) => {
			if (!template) return;
			setTemplateName(template.name);
			setExercises(template.exercises.map(fromTemplateExercise));
		});
	}, [id, userId]);

	// Filtered list (search + muscle group filter)
	const filteredExercises = useMemo(() => {
		let list = availableExercises;
		if (filterMuscle) list = list.filter((e) => e.muscleGroup === filterMuscle);
		const q = searchQuery.toLowerCase().trim();
		if (q) {
			list = list.filter(
				(e) =>
					e.name.toLowerCase().includes(q) ||
					MUSCLE_GROUP_LABELS[e.muscleGroup]?.toLowerCase().includes(q),
			);
		}
		return list;
	}, [searchQuery, filterMuscle, availableExercises]);

	// Alphabetical sections for SectionList
	const alphabeticalSections = useMemo(() => {
		const sorted = [...filteredExercises].sort((a, b) => a.name.localeCompare(b.name));
		const byLetter: Record<string, Exercise[]> = {};
		for (const ex of sorted) {
			const letter = ex.name[0]?.toUpperCase() ?? "#";
			if (!byLetter[letter]) byLetter[letter] = [];
			byLetter[letter].push(ex);
		}
		return Object.keys(byLetter)
			.sort()
			.map((letter) => ({ title: letter, data: byLetter[letter] }));
	}, [filteredExercises]);

	const availableLetters = useMemo(
		() => alphabeticalSections.map((s) => s.title),
		[alphabeticalSections],
	);

	const sectionListRef = useRef<SectionList<Exercise>>(null);

	function scrollToLetter(letter: string) {
		const sectionIndex = alphabeticalSections.findIndex((s) => s.title === letter);
		if (sectionIndex === -1) return;
		sectionListRef.current?.scrollToLocation({
			sectionIndex,
			itemIndex: 0,
			viewOffset: 0,
			animated: true,
		});
	}

	const addExercise = useCallback((exercise: Exercise) => {
		setExercises((prev) => {
			if (prev.some((e) => e.exerciseId === exercise.id)) {
				Alert.alert("Already Added", `${exercise.name} is already in this template.`);
				return prev;
			}
			return [
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
			];
		});
		setShowPicker(false);
		setSearchQuery("");
	}, []);

	const removeExercise = useCallback((exerciseId: string) => {
		setExercises((prev) => prev.filter((e) => e.exerciseId !== exerciseId));
	}, []);

	const updateEntry = useCallback((exerciseId: string, patch: Partial<ExerciseEntry>) => {
		setExercises((prev) =>
			prev.map((e) => (e.exerciseId === exerciseId ? { ...e, ...patch } : e)),
		);
	}, []);

	const handleSave = useCallback(async () => {
		if (!templateName.trim()) {
			Alert.alert("Name Required", "Please give your template a name.");
			return;
		}
		if (exercises.length === 0) {
			Alert.alert("No Exercises", "Add at least one exercise to your template.");
			return;
		}
		if (!userId) return;
		setSaving(true);
		try {
			const data = {
				name: templateName.trim(),
				exercises: exercises.map(toTemplateExercise),
			};
			if (isEditing && id) {
				await workoutService.updateTemplate(userId, id, data);
			} else {
				await workoutService.createTemplate(userId, data);
			}
			router.back();
		} catch {
			Alert.alert("Error", "Failed to save template. Please try again.");
		} finally {
			setSaving(false);
		}
	}, [templateName, exercises, userId, isEditing, id]);

	if (isLoaded && !userId) return <Redirect href="/login" />;

	return (
		<ThemedView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={[styles.headerCancelBtn, { backgroundColor: glassCard, borderColor: glassBorder }]}
					onPress={() => router.back()}
				>
					<Ionicons name="close" size={18} color={secondaryText} />
				</TouchableOpacity>
				<ThemedText style={styles.headerTitle}>
					{isEditing ? "Edit Template" : "New Template"}
				</ThemedText>
				<TouchableOpacity
					style={[styles.headerSaveBtn, { backgroundColor: primary }]}
					onPress={handleSave}
					disabled={saving}
				>
					<ThemedText style={styles.headerSaveBtnText}>
						{saving ? "Saving…" : "Save"}
					</ThemedText>
				</TouchableOpacity>
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				{/* Template name input */}
				<ThemedText style={[styles.sectionLabel, { color: tertiaryText }]}>
					TEMPLATE NAME
				</ThemedText>
				<TextInput
					style={[
						styles.nameInput,
						{ backgroundColor: glassCard, color: textColor, borderColor: glassBorder },
					]}
					value={templateName}
					onChangeText={setTemplateName}
					placeholder="e.g. Push Day"
					placeholderTextColor={tertiaryText}
					returnKeyType="done"
				/>

				{/* Exercise list */}
				{exercises.length > 0 && (
					<ThemedText style={[styles.sectionLabel, { color: tertiaryText }]}>
						EXERCISES ({exercises.length})
					</ThemedText>
				)}

				{exercises.map((entry, idx) => (
					<ExerciseCard
						key={entry.exerciseId}
						entry={entry}
						index={idx}
						onRemove={() => removeExercise(entry.exerciseId)}
						onUpdate={(patch) => updateEntry(entry.exerciseId, patch)}
					/>
				))}

				{/* Add Exercise button */}
				<TouchableOpacity
					style={[
						styles.addExerciseBtn,
						{ borderColor: primary, backgroundColor: accentTint },
					]}
					onPress={() => setShowPicker(true)}
				>
					<View style={[styles.addExerciseIcon, { backgroundColor: primary }]}>
						<Ionicons name="add" size={16} color="#fff" />
					</View>
					<ThemedText style={[styles.addExerciseBtnText, { color: primary }]}>
						Add Exercise
					</ThemedText>
				</TouchableOpacity>

				{exercises.length > 0 && (
					<TouchableOpacity
						style={[styles.saveBtn, { backgroundColor: primary }]}
						onPress={handleSave}
						disabled={saving}
					>
						<Ionicons name="checkmark-circle" size={20} color="#fff" />
						<ThemedText style={styles.saveBtnText}>
							{saving ? "Saving…" : isEditing ? "Update Template" : "Save Template"}
						</ThemedText>
					</TouchableOpacity>
				)}
			</ScrollView>

			{/* ── Exercise Picker Modal ──────────────────────────────────────── */}
			<Modal
				visible={showPicker}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => {
					setShowPicker(false);
					setSearchQuery("");
					setFilterMuscle(null);
				}}
			>
				<View style={[styles.pickerContainer, { backgroundColor: background }]}>
					{/* Picker header */}
					<View style={styles.pickerHeader}>
						<TouchableOpacity
							style={[styles.pickerCloseBtn, { backgroundColor: glassCard, borderColor: glassBorder }]}
							onPress={() => {
								setShowPicker(false);
								setSearchQuery("");
								setFilterMuscle(null);
							}}
						>
							<Ionicons name="close" size={18} color={secondaryText} />
						</TouchableOpacity>
						<ThemedText style={styles.pickerTitle}>Add Exercise</ThemedText>
						<View style={styles.pickerHeaderRight}>
							<ThemedText style={[styles.pickerCount, { color: tertiaryText }]}>
								{filteredExercises.length}
							</ThemedText>
						</View>
					</View>

					{/* Search bar */}
					<View
						style={[
							styles.searchBar,
							{ backgroundColor: glassCard, borderColor: glassBorder },
						]}
					>
						<Ionicons name="search" size={16} color={tertiaryText} />
						<TextInput
							style={[styles.searchInput, { color: textColor }]}
							value={searchQuery}
							onChangeText={setSearchQuery}
							placeholder="Search exercises…"
							placeholderTextColor={tertiaryText}
							returnKeyType="search"
						/>
						{searchQuery.length > 0 && (
							<TouchableOpacity onPress={() => setSearchQuery("")}>
								<Ionicons name="close-circle" size={16} color={tertiaryText} />
							</TouchableOpacity>
						)}
					</View>

					{/* Muscle group filter chips */}
					<FlatList
						data={[null, ...MUSCLE_GROUP_ORDER] as (MuscleGroup | null)[]}
						keyExtractor={(item) => item ?? "all"}
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.filterChipsList}
						contentContainerStyle={styles.filterChips}
						renderItem={({ item: group }) => {
							const isActive = filterMuscle === group;
							const label = group ? (MUSCLE_GROUP_LABELS[group] ?? group) : "All";
							return (
								<TouchableOpacity
									style={[
										styles.filterChip,
										{
											backgroundColor: isActive ? primary : glassCard,
											borderColor: isActive ? primary : glassBorder,
										},
									]}
									onPress={() => setFilterMuscle(isActive ? null : group)}
								>
									<ThemedText
										style={[
											styles.filterChipText,
											{ color: isActive ? "#fff" : secondaryText },
										]}
									>
										{label}
									</ThemedText>
								</TouchableOpacity>
							);
						}}
					/>

					{/* Exercise list */}
					{loadingExercises ? (
						<View style={styles.pickerLoading}>
							<ActivityIndicator color={primary} size="large" />
							<ThemedText style={[styles.pickerLoadingText, { color: tertiaryText }]}>
								Loading exercises…
							</ThemedText>
						</View>
					) : alphabeticalSections.length === 0 ? (
						<View style={styles.pickerLoading}>
							<Ionicons name="search-outline" size={48} color={tertiaryText} />
							<ThemedText style={[styles.pickerLoadingText, { color: tertiaryText }]}>
								No exercises found
							</ThemedText>
						</View>
					) : (
						<View style={styles.listWrapper}>
							<SectionList
								ref={sectionListRef}
								sections={alphabeticalSections}
								keyExtractor={(item) => item.id}
								keyboardShouldPersistTaps="handled"
								showsVerticalScrollIndicator={false}
								stickySectionHeadersEnabled
								onScrollToIndexFailed={() => {}}
								renderSectionHeader={({ section }) => (
									<View
										style={[
											styles.sectionHeader,
											{ backgroundColor: background, borderBottomColor: glassDivider },
										]}
									>
										<ThemedText style={[styles.sectionLetter, { color: primary }]}>
											{section.title}
										</ThemedText>
										<View style={[styles.sectionDivider, { backgroundColor: glassDivider }]} />
									</View>
								)}
								renderItem={({ item: ex }) => {
									const alreadyAdded = exercises.some((e) => e.exerciseId === ex.id);
									return (
										<ExercisePickerRow
											exercise={ex}
											alreadyAdded={alreadyAdded}
											onPress={() => addExercise(ex)}
										/>
									);
								}}
							/>

							{/* Alphabet scrubber */}
							{!searchQuery && (
								<View style={styles.alphabetScrubber} pointerEvents="box-none">
									{availableLetters.map((letter) => (
										<TouchableOpacity
											key={letter}
											onPress={() => scrollToLetter(letter)}
											hitSlop={{ top: 2, bottom: 2, left: 6, right: 6 }}
										>
											<ThemedText style={[styles.scrubberLetter, { color: primary }]}>
												{letter}
											</ThemedText>
										</TouchableOpacity>
									))}
								</View>
							)}
						</View>
					)}
				</View>
			</Modal>
		</ThemedView>
	);
}

// ─── Exercise Picker Row ───────────────────────────────────────────────────────

function ExercisePickerRow({
	exercise,
	alreadyAdded,
	onPress,
}: {
	exercise: Exercise;
	alreadyAdded: boolean;
	onPress: () => void;
}) {
	const scheme = useColorScheme();
	const muscleColorMap = MuscleGroupColors[scheme];

	const glassDivider = useThemeColor({}, "glassDivider");
	const secondaryText = useThemeColor({}, "secondaryText");
	const primary = useThemeColor({}, "primary");
	const success = useThemeColor({}, "success");
	const accentTint = useThemeColor({}, "accentTint");

	const muscleColors = muscleColorMap[exercise.muscleGroup as keyof typeof muscleColorMap] ?? {
		bg: accentTint,
		text: primary,
	};

	return (
		<TouchableOpacity
			style={[styles.pickerRow, { borderBottomColor: glassDivider }]}
			onPress={onPress}
			disabled={alreadyAdded}
			activeOpacity={0.7}
		>
			{/* Placeholder thumbnail */}
			<View style={[styles.thumbnail, { backgroundColor: muscleColors.bg }]}>
				<Ionicons name="barbell-outline" size={22} color={muscleColors.text} />
			</View>

			{/* Exercise info */}
			<View style={styles.pickerRowInfo}>
				<ThemedText
					style={[styles.pickerRowName, alreadyAdded && { color: secondaryText }]}
					numberOfLines={1}
				>
					{exercise.name}
				</ThemedText>
				<ThemedText style={[styles.pickerRowMuscle, { color: muscleColors.text }]}>
					{MUSCLE_GROUP_LABELS[exercise.muscleGroup] ?? exercise.muscleGroup}
				</ThemedText>
			</View>

			{/* Right action */}
			{alreadyAdded ? (
				<View style={[styles.addedBadge, { backgroundColor: success + "20" }]}>
					<Ionicons name="checkmark" size={14} color={success} />
					<ThemedText style={[styles.addedText, { color: success }]}>Added</ThemedText>
				</View>
			) : (
				<View style={[styles.addCircle, { backgroundColor: accentTint, borderColor: primary + "40" }]}>
					<Ionicons name="add" size={18} color={primary} />
				</View>
			)}
		</TouchableOpacity>
	);
}

// ─── Exercise Card (template builder) ─────────────────────────────────────────

function ExerciseCard({
	entry,
	index,
	onRemove,
	onUpdate,
}: {
	entry: ExerciseEntry;
	index: number;
	onRemove: () => void;
	onUpdate: (patch: Partial<ExerciseEntry>) => void;
}) {
	const scheme = useColorScheme();
	const muscleColorMap = MuscleGroupColors[scheme];

	const glassCard = useThemeColor({}, "glassCard");
	const glassBorder = useThemeColor({}, "glassBorder");
	const primary = useThemeColor({}, "primary");
	const danger = useThemeColor({}, "danger");
	const dangerTint = useThemeColor({}, "dangerTint");

	const muscleColors = muscleColorMap[entry.muscleGroup as keyof typeof muscleColorMap] ?? {
		bg: "transparent",
		text: primary,
	};

	return (
		<View style={[styles.exerciseCard, { backgroundColor: glassCard, borderColor: glassBorder }]}>
			{/* Left accent bar */}
			<View style={[styles.cardAccentBar, { backgroundColor: primary }]} />

			<View style={styles.cardInner}>
				{/* Card header */}
				<View style={styles.exerciseCardHeader}>
					<View style={styles.exerciseCardTitleRow}>
						<ThemedText style={styles.exerciseCardIndex}>{index + 1}</ThemedText>
						<View style={styles.exerciseCardNameBlock}>
							<ThemedText style={styles.exerciseName} numberOfLines={1}>
								{entry.exerciseName}
							</ThemedText>
							<View style={[styles.musclePill, { backgroundColor: muscleColors.bg }]}>
								<ThemedText style={[styles.musclePillText, { color: muscleColors.text }]}>
									{MUSCLE_GROUP_LABELS[entry.muscleGroup]}
								</ThemedText>
							</View>
						</View>
					</View>
					<TouchableOpacity
						style={[styles.removeBtn, { backgroundColor: dangerTint }]}
						onPress={onRemove}
					>
						<Ionicons name="trash-outline" size={15} color={danger} />
					</TouchableOpacity>
				</View>

				{/* Fields */}
				<View style={styles.fieldsRow}>
					<FieldStepper
						label="Sets"
						value={entry.setCount}
						min={1}
						max={10}
						onChange={(v) => onUpdate({ setCount: v })}
					/>
					<FieldInput
						label="Reps"
						value={entry.defaultReps}
						onChange={(v) => onUpdate({ defaultReps: v })}
					/>
					<FieldInput
						label="Wt (lb)"
						value={entry.defaultWeight}
						onChange={(v) => onUpdate({ defaultWeight: v })}
					/>
					<FieldInput
						label="Rest (s)"
						value={entry.restSeconds}
						onChange={(v) => onUpdate({ restSeconds: v })}
					/>
				</View>
			</View>
		</View>
	);
}

// ─── FieldStepper ──────────────────────────────────────────────────────────────

function FieldStepper({
	label,
	value,
	min,
	max,
	onChange,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	onChange: (v: number) => void;
}) {
	const textColor = useThemeColor({}, "text");
	const secondaryText = useThemeColor({}, "secondaryText");
	const primary = useThemeColor({}, "primary");
	const accentTint = useThemeColor({}, "accentTint");

	return (
		<View style={styles.fieldBox}>
			<ThemedText style={[styles.fieldLabel, { color: secondaryText }]}>{label}</ThemedText>
			<View style={styles.stepper}>
				<TouchableOpacity
					style={[styles.stepperBtn, { backgroundColor: accentTint }]}
					onPress={() => onChange(Math.max(min, value - 1))}
					hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
				>
					<Ionicons name="remove" size={14} color={primary} />
				</TouchableOpacity>
				<ThemedText style={[styles.stepperValue, { color: textColor }]}>{value}</ThemedText>
				<TouchableOpacity
					style={[styles.stepperBtn, { backgroundColor: accentTint }]}
					onPress={() => onChange(Math.min(max, value + 1))}
					hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
				>
					<Ionicons name="add" size={14} color={primary} />
				</TouchableOpacity>
			</View>
		</View>
	);
}

// ─── FieldInput ───────────────────────────────────────────────────────────────

function FieldInput({
	label,
	value,
	onChange,
}: {
	label: string;
	value: number;
	onChange: (v: number) => void;
}) {
	const textColor = useThemeColor({}, "text");
	const secondaryText = useThemeColor({}, "secondaryText");
	const inputBg = useThemeColor({}, "inputBg");
	const glassBorder = useThemeColor({}, "glassBorder");

	return (
		<View style={styles.fieldBox}>
			<ThemedText style={[styles.fieldLabel, { color: secondaryText }]}>{label}</ThemedText>
			<TextInput
				style={[styles.fieldInput, { backgroundColor: inputBg, color: textColor, borderColor: glassBorder }]}
				value={value === 0 ? "" : String(value)}
				onChangeText={(t) => {
					const n = parseInt(t, 10);
					onChange(isNaN(n) ? 0 : n);
				}}
				keyboardType="numeric"
				returnKeyType="done"
				maxLength={5}
				placeholder="0"
				placeholderTextColor={secondaryText}
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
	// ── Header ────────────────────────────────────────────────────────────────
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		marginBottom: 24,
	},
	headerCancelBtn: {
		width: 38,
		height: 38,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
	},
	headerTitle: {
		fontSize: 17,
		fontWeight: "700",
	},
	headerSaveBtn: {
		paddingHorizontal: 18,
		paddingVertical: 9,
		borderRadius: 12,
	},
	headerSaveBtnText: {
		color: "#fff",
		fontSize: 15,
		fontWeight: "700",
	},
	// ── Scroll content ────────────────────────────────────────────────────────
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 60,
	},
	sectionLabel: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.8,
		textTransform: "uppercase",
		marginBottom: 10,
		marginTop: 4,
	},
	nameInput: {
		fontSize: 17,
		fontWeight: "500",
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderRadius: 14,
		borderWidth: 1,
		marginBottom: 28,
	},
	// ── Exercise card (builder) ───────────────────────────────────────────────
	exerciseCard: {
		flexDirection: "row",
		borderRadius: 18,
		marginBottom: 12,
		borderWidth: 1,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.08,
		shadowRadius: 10,
		elevation: 2,
	},
	cardAccentBar: {
		width: 4,
		margin: 12,
		marginRight: 0,
		borderRadius: 2,
	},
	cardInner: {
		flex: 1,
		padding: 14,
		paddingLeft: 12,
	},
	exerciseCardHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 14,
		gap: 8,
	},
	exerciseCardTitleRow: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	exerciseCardIndex: {
		fontSize: 13,
		fontWeight: "700",
		opacity: 0.4,
		width: 18,
	},
	exerciseCardNameBlock: {
		flex: 1,
		gap: 4,
	},
	exerciseName: {
		fontSize: 16,
		fontWeight: "700",
		letterSpacing: -0.2,
	},
	musclePill: {
		alignSelf: "flex-start",
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 20,
	},
	musclePillText: {
		fontSize: 11,
		fontWeight: "600",
	},
	removeBtn: {
		width: 32,
		height: 32,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	// ── Fields row ────────────────────────────────────────────────────────────
	fieldsRow: {
		flexDirection: "row",
		gap: 8,
	},
	fieldBox: {
		flex: 1,
		alignItems: "center",
		gap: 6,
	},
	fieldLabel: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 0.5,
		textTransform: "uppercase",
	},
	stepper: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	stepperBtn: {
		width: 26,
		height: 26,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	stepperValue: {
		fontSize: 16,
		fontWeight: "700",
		minWidth: 22,
		textAlign: "center",
		fontVariant: ["tabular-nums"],
	},
	fieldInput: {
		width: "100%",
		textAlign: "center",
		fontSize: 15,
		fontWeight: "600",
		paddingVertical: 7,
		borderRadius: 10,
		borderWidth: 1,
		fontVariant: ["tabular-nums"],
	},
	// ── Add / Save buttons ────────────────────────────────────────────────────
	addExerciseBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		paddingVertical: 15,
		borderRadius: 16,
		borderWidth: 1,
		marginTop: 4,
		marginBottom: 16,
	},
	addExerciseIcon: {
		width: 24,
		height: 24,
		borderRadius: 7,
		alignItems: "center",
		justifyContent: "center",
	},
	addExerciseBtnText: {
		fontSize: 16,
		fontWeight: "700",
	},
	saveBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 17,
		borderRadius: 18,
		marginTop: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 12,
		elevation: 5,
	},
	saveBtnText: {
		color: "#fff",
		fontSize: 17,
		fontWeight: "700",
	},
	// ── Picker Modal ──────────────────────────────────────────────────────────
	pickerContainer: {
		flex: 1,
		paddingTop: 20,
	},
	pickerHeader: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		marginBottom: 16,
		gap: 12,
	},
	pickerCloseBtn: {
		width: 36,
		height: 36,
		borderRadius: 11,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
	},
	pickerTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: "700",
		letterSpacing: -0.3,
	},
	pickerHeaderRight: {
		minWidth: 36,
		alignItems: "flex-end",
	},
	pickerCount: {
		fontSize: 14,
		fontWeight: "500",
	},
	// ── Search bar ────────────────────────────────────────────────────────────
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginHorizontal: 16,
		marginBottom: 12,
		paddingHorizontal: 14,
		paddingVertical: 11,
		borderRadius: 14,
		borderWidth: 1,
	},
	searchInput: {
		flex: 1,
		fontSize: 15,
		padding: 0,
	},
	// ── Filter chips ──────────────────────────────────────────────────────────
	filterChipsList: {
		flexGrow: 0,
		marginBottom: 8,
	},
	filterChips: {
		paddingHorizontal: 16,
		gap: 8,
		paddingVertical: 4,
		alignItems: "center",
	},
	filterChip: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
		alignSelf: "flex-start",
	},
	filterChipText: {
		fontSize: 13,
		fontWeight: "600",
	},
	// ── List ──────────────────────────────────────────────────────────────────
	listWrapper: {
		flex: 1,
		flexDirection: "row",
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 8,
		gap: 12,
		borderBottomWidth: 1,
	},
	sectionLetter: {
		fontSize: 14,
		fontWeight: "800",
		width: 16,
	},
	sectionDivider: {
		flex: 1,
		height: 1,
	},
	// ── Picker row ────────────────────────────────────────────────────────────
	pickerRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		gap: 14,
		borderBottomWidth: 1,
	},
	thumbnail: {
		width: 50,
		height: 50,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	pickerRowInfo: {
		flex: 1,
		gap: 3,
	},
	pickerRowName: {
		fontSize: 16,
		fontWeight: "600",
	},
	pickerRowMuscle: {
		fontSize: 13,
		fontWeight: "500",
	},
	addedBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 10,
	},
	addedText: {
		fontSize: 12,
		fontWeight: "700",
	},
	addCircle: {
		width: 32,
		height: 32,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
	},
	// ── Alphabet scrubber ─────────────────────────────────────────────────────
	alphabetScrubber: {
		paddingVertical: 8,
		paddingRight: 6,
		alignItems: "center",
		justifyContent: "center",
		gap: 1,
	},
	scrubberLetter: {
		fontSize: 11,
		fontWeight: "700",
		paddingVertical: 1,
		paddingHorizontal: 4,
	},
	// ── Loading / empty ───────────────────────────────────────────────────────
	pickerLoading: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 12,
	},
	pickerLoadingText: {
		fontSize: 15,
	},
});
