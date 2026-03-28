import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ExerciseListItem } from "@/components/workout/ExerciseListItem";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MUSCLE_GROUP_LABELS } from "@/src/data/exerciseLibrary";
import { useAppContext } from "@/src/context/AppContext";
import { useWorkout } from "@/src/context/WorkoutContext";
import * as workoutService from "@/src/services/workoutService";
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

export default function TemplateDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { userId } = useAppContext();
	const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
	const { startWorkout } = useWorkout();

	const accentColor = useThemeColor({ light: "#3498db", dark: "#3498db" }, "accent");
	const secondaryText = useThemeColor({ light: "#666666", dark: "#8e8e93" }, "secondaryText");
	const cardBg = useThemeColor({ light: "#f8f8f8", dark: "#1c1c1e" }, "card");
	const cardBorder = useThemeColor({ light: "#e8e8e8", dark: "#2c2c2e" }, "cardBorder");
	const colorScheme = useColorScheme();
	const muscleColorMap =
		colorScheme === "dark" ? MUSCLE_GROUP_COLORS_DARK : MUSCLE_GROUP_COLORS;

	// Real-time listener — reflects edits immediately without a re-fetch.
	useEffect(() => {
		if (!id || !userId) return;
		const unsubscribe = workoutService.subscribeToTemplate(
			userId,
			id,
			(t) => {
				if (!t) {
					Alert.alert("Not Found", "This template no longer exists.", [
						{ text: "OK", onPress: () => router.back() },
					]);
					return;
				}
				setTemplate(t);
			},
			() => {
				Alert.alert("Error", "Failed to load template.", [
					{ text: "OK", onPress: () => router.back() },
				]);
			},
		);
		return unsubscribe;
	}, [id, userId]);

	const handleStartWorkout = useCallback(() => {
		if (!template) return;
		startWorkout(template);
		router.push("/active-workout");
	}, [template, startWorkout]);

	if (!template) {
		return (
			<ThemedView style={styles.container}>
				<ThemedText style={[styles.loadingText, { color: secondaryText }]}>
					Loading…
				</ThemedText>
			</ThemedView>
		);
	}

	const uniqueMuscleGroups = [...new Set(template.exercises.map((e) => e.muscleGroup))];

	return (
		<ThemedView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
					<Ionicons name="chevron-back" size={24} color={accentColor} />
					<ThemedText style={[styles.backText, { color: accentColor }]}>Back</ThemedText>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => router.push(`/workout/create?id=${template.id}`)}>
					<ThemedText style={[styles.editBtn, { color: accentColor }]}>Edit</ThemedText>
				</TouchableOpacity>
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Template title block */}
				<View style={styles.titleBlock}>
					<ThemedText type="title" style={styles.templateName}>
						{template.name}
					</ThemedText>

					{/* Muscle group chips */}
					{uniqueMuscleGroups.length > 0 && (
						<View style={styles.chipsRow}>
							{uniqueMuscleGroups.map((group) => {
								const colors = muscleColorMap[group] ?? {
									bg: "#e8e8e8",
									text: "#555",
								};
								return (
									<View
										key={group}
										style={[styles.chip, { backgroundColor: colors.bg }]}
									>
										<ThemedText
											style={[styles.chipText, { color: colors.text }]}
										>
											{MUSCLE_GROUP_LABELS[group] ?? group}
										</ThemedText>
									</View>
								);
							})}
						</View>
					)}
				</View>

				{/* Stats row */}
				<View style={[styles.statsRow, { backgroundColor: cardBg, borderColor: cardBorder }]}>
					<View style={styles.statItem}>
						<ThemedText style={[styles.statValue, { color: accentColor }]}>
							{template.exercises.length}
						</ThemedText>
						<ThemedText style={[styles.statLabel, { color: secondaryText }]}>
							Exercises
						</ThemedText>
					</View>
					<View style={[styles.statDivider, { backgroundColor: cardBorder }]} />
					<View style={styles.statItem}>
						<ThemedText style={[styles.statValue, { color: accentColor }]}>
							{template.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
						</ThemedText>
						<ThemedText style={[styles.statLabel, { color: secondaryText }]}>
							Total Sets
						</ThemedText>
					</View>
					<View style={[styles.statDivider, { backgroundColor: cardBorder }]} />
					<View style={styles.statItem}>
						<ThemedText style={[styles.statValue, { color: accentColor }]}>
							{uniqueMuscleGroups.length}
						</ThemedText>
						<ThemedText style={[styles.statLabel, { color: secondaryText }]}>
							Muscle Groups
						</ThemedText>
					</View>
				</View>

				{/* Exercise list */}
				<ThemedText style={[styles.sectionLabel, { color: secondaryText }]}>
					EXERCISES
				</ThemedText>
				<View
					style={[
						styles.exerciseList,
						{ backgroundColor: cardBg, borderColor: cardBorder },
					]}
				>
					{template.exercises.map((ex, idx) => (
						<ExerciseListItem key={ex.exerciseId} exercise={ex} index={idx} />
					))}
				</View>

				<View style={styles.bottomSpacer} />
			</ScrollView>

			{/* Sticky start button */}
			<View style={styles.stickyFooter}>
				<TouchableOpacity
					style={[styles.startBtn, { backgroundColor: accentColor }]}
					onPress={handleStartWorkout}
					activeOpacity={0.85}
				>
					<Ionicons name="play" size={18} color="#fff" />
					<ThemedText style={styles.startBtnText}>Start Workout</ThemedText>
				</TouchableOpacity>
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 60,
	},
	loadingText: {
		textAlign: "center",
		marginTop: 40,
		fontSize: 16,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		marginBottom: 8,
	},
	backBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
	},
	backText: {
		fontSize: 17,
	},
	editBtn: {
		fontSize: 17,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 20,
	},
	titleBlock: {
		marginBottom: 20,
	},
	templateName: {
		fontSize: 32,
		fontWeight: "800",
		marginBottom: 10,
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
	statsRow: {
		flexDirection: "row",
		borderRadius: 14,
		borderWidth: 1,
		padding: 16,
		marginBottom: 24,
	},
	statItem: {
		flex: 1,
		alignItems: "center",
		gap: 2,
	},
	statValue: {
		fontSize: 22,
		fontWeight: "700",
	},
	statLabel: {
		fontSize: 12,
	},
	statDivider: {
		width: StyleSheet.hairlineWidth,
		marginHorizontal: 8,
	},
	sectionLabel: {
		fontSize: 12,
		fontWeight: "600",
		letterSpacing: 0.8,
		marginBottom: 8,
	},
	exerciseList: {
		borderRadius: 14,
		paddingHorizontal: 16,
		borderWidth: 1,
	},
	bottomSpacer: {
		height: 100,
	},
	stickyFooter: {
		position: "absolute",
		bottom: 34,
		left: 16,
		right: 16,
	},
	startBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 16,
		borderRadius: 14,
	},
	startBtnText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "700",
	},
});
