import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ExerciseListItem } from "@/components/workout/ExerciseListItem";
import { MuscleGroupColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MUSCLE_GROUP_LABELS } from "@/src/data/exerciseLibrary";
import { useAppContext } from "@/src/context/AppContext";
import { useWorkout } from "@/src/context/WorkoutContext";
import * as workoutService from "@/src/services/workoutService";
import { WorkoutTemplate } from "@/src/types/workout";

export default function TemplateDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { userId } = useAppContext();
	const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
	const { startWorkout } = useWorkout();

	const scheme = useColorScheme();
	const muscleColorMap = MuscleGroupColors[scheme];

	const primary = useThemeColor({}, "primary");
	const secondaryText = useThemeColor({}, "secondaryText");
	const glassCard = useThemeColor({}, "glassCard");
	const glassBorder = useThemeColor({}, "glassBorder");
	const accentTint = useThemeColor({}, "accentTint");

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
			{/* Header nav */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
					<View
						style={[
							styles.navBtn,
							{ backgroundColor: glassCard, borderColor: glassBorder },
						]}
					>
						<Ionicons name="chevron-back" size={20} color={primary} />
					</View>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.editPill, { backgroundColor: glassCard, borderColor: glassBorder }]}
					onPress={() => router.push(`/workout/create?id=${template.id}`)}
				>
					<Ionicons name="pencil-outline" size={14} color={primary} />
					<ThemedText style={[styles.editPillText, { color: primary }]}>Edit</ThemedText>
				</TouchableOpacity>
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Title block */}
				<ThemedText style={styles.templateName}>{template.name}</ThemedText>

				{/* Muscle group chips */}
				{uniqueMuscleGroups.length > 0 && (
					<View style={styles.chipsRow}>
						{uniqueMuscleGroups.map((g) => {
							const colors = muscleColorMap[g as keyof typeof muscleColorMap] ?? {
								bg: accentTint,
								text: primary,
							};
							return (
								<View key={g} style={[styles.chip, { backgroundColor: colors.bg }]}>
									<ThemedText style={[styles.chipText, { color: colors.text }]}>
										{MUSCLE_GROUP_LABELS[g] ?? g}
									</ThemedText>
								</View>
							);
						})}
					</View>
				)}

				{/* Stats row */}
				<View
					style={[styles.statsRow, { backgroundColor: glassCard, borderColor: glassBorder }]}
				>
					<View style={styles.statItem}>
						<ThemedText style={[styles.statValue, { color: primary }]}>
							{template.exercises.length}
						</ThemedText>
						<ThemedText style={[styles.statLabel, { color: secondaryText }]}>
							Exercises
						</ThemedText>
					</View>
					<View style={[styles.statDivider, { backgroundColor: glassBorder }]} />
					<View style={styles.statItem}>
						<ThemedText style={[styles.statValue, { color: primary }]}>
							{template.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
						</ThemedText>
						<ThemedText style={[styles.statLabel, { color: secondaryText }]}>
							Total Sets
						</ThemedText>
					</View>
					<View style={[styles.statDivider, { backgroundColor: glassBorder }]} />
					<View style={styles.statItem}>
						<ThemedText style={[styles.statValue, { color: primary }]}>
							{uniqueMuscleGroups.length}
						</ThemedText>
						<ThemedText style={[styles.statLabel, { color: secondaryText }]}>
							Muscles
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
						{ backgroundColor: glassCard, borderColor: glassBorder },
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
					style={[styles.startBtn, { backgroundColor: primary }]}
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
		marginBottom: 12,
	},
	backBtn: {},
	navBtn: {
		width: 38,
		height: 38,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
	},
	editPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 12,
		borderWidth: 1,
	},
	editPillText: {
		fontSize: 14,
		fontWeight: "600",
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 20,
	},
	templateName: {
		fontSize: 34,
		fontWeight: "800",
		letterSpacing: -0.8,
		marginBottom: 12,
	},
	chipsRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
		marginBottom: 24,
	},
	chip: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 20,
	},
	chipText: {
		fontSize: 12,
		fontWeight: "600",
	},
	statsRow: {
		flexDirection: "row",
		borderRadius: 16,
		borderWidth: 1,
		paddingVertical: 18,
		marginBottom: 28,
	},
	statItem: {
		flex: 1,
		alignItems: "center",
		gap: 4,
	},
	statValue: {
		fontSize: 22,
		fontWeight: "800",
		fontVariant: ["tabular-nums"],
	},
	statLabel: {
		fontSize: 12,
		fontWeight: "500",
	},
	statDivider: {
		width: 1,
		alignSelf: "stretch",
		marginVertical: 4,
	},
	sectionLabel: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 1,
		textTransform: "uppercase",
		marginBottom: 10,
		marginLeft: 4,
	},
	exerciseList: {
		borderRadius: 18,
		paddingHorizontal: 16,
		borderWidth: 1,
	},
	bottomSpacer: {
		height: 110,
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
		paddingVertical: 17,
		borderRadius: 18,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.25,
		shadowRadius: 14,
		elevation: 7,
	},
	startBtnText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "700",
		letterSpacing: -0.2,
	},
});
