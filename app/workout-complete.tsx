import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useWorkout } from "@/src/context/WorkoutContext";
import { formatDate, formatDuration, getBestSet } from "@/src/services/workoutService";
import { LoggedExercise } from "@/src/types/workout";

export default function WorkoutCompleteScreen() {
	const { completedLog, clearCompletedLog } = useWorkout();

	const primary = useThemeColor({}, "primary");
	const success = useThemeColor({}, "success");
	const gold = useThemeColor({}, "gold");
	const glassCard = useThemeColor({}, "glassCard");
	const glassBorder = useThemeColor({}, "glassBorder");
	const glassDivider = useThemeColor({}, "glassDivider");
	const secondaryText = useThemeColor({}, "secondaryText");
	const accentTint = useThemeColor({}, "accentTint");
	const successTint = useThemeColor({}, "successTint");
	const goldTint = useThemeColor({}, "goldTint");

	function handleDone() {
		clearCompletedLog();
		router.replace("/(tabs)/workout");
	}

	if (!completedLog) {
		router.replace("/(tabs)/workout");
		return null;
	}

	return (
		<ThemedView style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Trophy */}
				<View style={[styles.trophyWrap, { backgroundColor: goldTint }]}>
					<Ionicons name="trophy" size={52} color={gold} />
				</View>

				<ThemedText style={styles.title}>Workout Complete!</ThemedText>
				<ThemedText style={styles.workoutName}>{completedLog.templateName}</ThemedText>
				<ThemedText style={[styles.dateText, { color: secondaryText }]}>
					{formatDate(completedLog.completedAt)}
				</ThemedText>

				{/* Stats row */}
				<View
					style={[styles.statsCard, { backgroundColor: glassCard, borderColor: glassBorder }]}
				>
					<StatItem
						icon="time-outline"
						label="Duration"
						value={formatDuration(completedLog.durationSeconds)}
						color={primary}
						iconBg={accentTint}
						secondaryText={secondaryText}
					/>
					<View style={[styles.statDivider, { backgroundColor: glassDivider }]} />
					<StatItem
						icon="barbell-outline"
						label="Volume"
						value={`${Math.round(completedLog.totalVolumeLbs).toLocaleString()} lb`}
						color={success}
						iconBg={successTint}
						secondaryText={secondaryText}
					/>
					<View style={[styles.statDivider, { backgroundColor: glassDivider }]} />
					<StatItem
						icon="trophy-outline"
						label="PRs"
						value={String(completedLog.personalRecords)}
						color={completedLog.personalRecords > 0 ? gold : secondaryText}
						iconBg={completedLog.personalRecords > 0 ? goldTint : "transparent"}
						secondaryText={secondaryText}
					/>
				</View>

				{/* Exercise breakdown */}
				<ThemedText style={[styles.sectionHeader, { color: secondaryText }]}>
					EXERCISES
				</ThemedText>
				<View
					style={[
						styles.exerciseList,
						{ backgroundColor: glassCard, borderColor: glassBorder },
					]}
				>
					{completedLog.exercises.map((ex, idx) => (
						<ExerciseResult
							key={ex.exerciseId}
							exercise={ex}
							index={idx}
							glassDivider={glassDivider}
							secondaryText={secondaryText}
							gold={gold}
							goldTint={goldTint}
						/>
					))}
				</View>
			</ScrollView>

			{/* Done button */}
			<View style={styles.stickyFooter}>
				<TouchableOpacity
					style={[styles.doneBtn, { backgroundColor: primary }]}
					onPress={handleDone}
				>
					<Ionicons name="checkmark-circle" size={20} color="#fff" />
					<ThemedText style={styles.doneBtnText}>Done</ThemedText>
				</TouchableOpacity>
			</View>
		</ThemedView>
	);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatItem({
	icon,
	label,
	value,
	color,
	iconBg,
	secondaryText,
}: {
	icon: string;
	label: string;
	value: string;
	color: string;
	iconBg: string;
	secondaryText: string;
}) {
	return (
		<View style={styles.statItem}>
			<View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>
				<Ionicons name={icon as any} size={18} color={color} />
			</View>
			<ThemedText style={[styles.statValue, { color }]}>{value}</ThemedText>
			<ThemedText style={[styles.statLabel, { color: secondaryText }]}>{label}</ThemedText>
		</View>
	);
}

function ExerciseResult({
	exercise,
	index,
	glassDivider,
	secondaryText,
	gold,
	goldTint,
}: {
	exercise: LoggedExercise;
	index: number;
	glassDivider: string;
	secondaryText: string;
	gold: string;
	goldTint: string;
}) {
	const completedSets = exercise.sets.filter((s) => s.completed);
	const bestSet = getBestSet(exercise.sets);
	const hasPR = exercise.sets.some((s) => s.isPersonalRecord);

	return (
		<View
			style={[
				styles.exerciseResult,
				index > 0 && { borderTopWidth: 1, borderTopColor: glassDivider },
			]}
		>
			<View style={styles.exerciseResultRow}>
				<ThemedText style={styles.exerciseResultName}>{exercise.exerciseName}</ThemedText>
				{hasPR && (
					<View style={[styles.prBadge, { backgroundColor: goldTint }]}>
						<Ionicons name="star" size={10} color={gold} />
						<ThemedText style={[styles.prText, { color: gold }]}>PR</ThemedText>
					</View>
				)}
			</View>
			<ThemedText style={[styles.exerciseResultMeta, { color: secondaryText }]}>
				{completedSets.length} set{completedSets.length !== 1 ? "s" : ""}
				{bestSet ? `  ·  Best: ${bestSet.actualWeight} lb × ${bestSet.actualReps}` : ""}
			</ThemedText>
		</View>
	);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 60,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 120,
		alignItems: "center",
	},
	trophyWrap: {
		width: 100,
		height: 100,
		borderRadius: 32,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 16,
		marginTop: 24,
	},
	title: {
		fontSize: 30,
		fontWeight: "800",
		marginBottom: 6,
		textAlign: "center",
		letterSpacing: -0.6,
	},
	workoutName: {
		fontSize: 18,
		fontWeight: "600",
		textAlign: "center",
		opacity: 0.8,
	},
	dateText: {
		fontSize: 14,
		marginTop: 4,
		marginBottom: 28,
		textAlign: "center",
	},
	statsCard: {
		flexDirection: "row",
		borderRadius: 20,
		borderWidth: 1,
		paddingVertical: 22,
		width: "100%",
		marginBottom: 32,
	},
	statItem: {
		flex: 1,
		alignItems: "center",
		gap: 5,
	},
	statIconWrap: {
		width: 36,
		height: 36,
		borderRadius: 11,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 2,
	},
	statValue: {
		fontSize: 17,
		fontWeight: "700",
		fontVariant: ["tabular-nums"],
	},
	statLabel: {
		fontSize: 11,
		fontWeight: "600",
	},
	statDivider: {
		width: 1,
		alignSelf: "stretch",
		marginVertical: 8,
	},
	sectionHeader: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 1,
		alignSelf: "flex-start",
		marginBottom: 10,
		marginLeft: 4,
		textTransform: "uppercase",
	},
	exerciseList: {
		borderRadius: 18,
		borderWidth: 1,
		paddingHorizontal: 16,
		width: "100%",
	},
	exerciseResult: {
		paddingVertical: 14,
	},
	exerciseResultRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 3,
	},
	exerciseResultName: {
		fontSize: 15,
		fontWeight: "600",
	},
	exerciseResultMeta: {
		fontSize: 13,
	},
	prBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
		paddingHorizontal: 7,
		paddingVertical: 3,
		borderRadius: 8,
	},
	prText: {
		fontSize: 10,
		fontWeight: "700",
	},
	stickyFooter: {
		position: "absolute",
		bottom: 34,
		left: 16,
		right: 16,
	},
	doneBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 17,
		borderRadius: 18,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.2,
		shadowRadius: 14,
		elevation: 7,
	},
	doneBtnText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "700",
		letterSpacing: -0.2,
	},
});
