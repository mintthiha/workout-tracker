import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ActiveExerciseCard } from "@/components/workout/ActiveExerciseCard";
import { RestTimerModal } from "@/components/workout/RestTimerModal";
import { WorkoutTimer } from "@/components/workout/WorkoutTimer";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useWorkout } from "@/src/context/WorkoutContext";

export default function ActiveWorkoutScreen() {
	const { session, finishWorkout, discardWorkout } = useWorkout();
	const [restVisible, setRestVisible] = useState(false);
	const [restSeconds, setRestSeconds] = useState(90);
	const [finishing, setFinishing] = useState(false);
	const [cancelModalVisible, setCancelModalVisible] = useState(false);
	const [incompleteModalVisible, setIncompleteModalVisible] = useState(false);

	const accentColor = useThemeColor({ light: "#3498db", dark: "#3498db" }, "accent");
	const dangerColor = "#ff3b30";
	const secondaryText = useThemeColor({ light: "#666666", dark: "#8e8e93" }, "secondaryText");
	const cardBg = useThemeColor({ light: "#f5f5f5", dark: "#1c1c1e" }, "card");
	const cardBorder = useThemeColor({ light: "#e0e0e0", dark: "#2c2c2e" }, "cardBorder");
	const bgColor = useThemeColor({ light: "#fff", dark: "#151718" }, "background");

	// Guard: if somehow we land here with no session, go back
	if (!session) {
		router.replace("/(tabs)/workout");
		return null;
	}

	function handleSetCompleted(seconds: number) {
		setRestSeconds(seconds);
		setRestVisible(true);
	}

	async function doFinish() {
		// Validate that at least one set has real data
		const hasValidData = session.exercises.some((ex) =>
			ex.sets.some((s) => s.actualReps > 0),
		);
		if (!hasValidData) {
			Alert.alert(
				"No Data Entered",
				"Please enter reps for at least one set before finishing.",
			);
			return;
		}

		setFinishing(true);
		try {
			await finishWorkout();
			router.replace("/workout-complete");
		} catch {
			Alert.alert("Error", "Failed to save workout. Please try again.");
		} finally {
			setFinishing(false);
		}
	}

	function handleFinishPress() {
		const incompleteSets = session.exercises.reduce(
			(total, ex) => total + ex.sets.filter((s) => !s.completed).length,
			0,
		);
		if (incompleteSets > 0) {
			setIncompleteModalVisible(true);
		} else {
			doFinish();
		}
	}

	return (
		<ThemedView style={styles.container}>
			{/* Header */}
			<View style={[styles.header, { borderBottomColor: cardBorder }]}>
				<View style={styles.headerLeft}>
					<ThemedText type="defaultSemiBold" style={styles.workoutName} numberOfLines={1}>
						{session.templateName}
					</ThemedText>
					<WorkoutTimer startedAt={session.startedAt} />
				</View>
				<TouchableOpacity
					onPress={() => setCancelModalVisible(true)}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Ionicons name="close" size={24} color={secondaryText} />
				</TouchableOpacity>
			</View>

			{/* Exercise list */}
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				{session.exercises.map((exercise, idx) => (
					<ActiveExerciseCard
						key={exercise.exerciseId}
						exercise={exercise}
						exerciseIdx={idx}
						onSetCompleted={handleSetCompleted}
					/>
				))}
				<View style={styles.bottomSpacer} />
			</ScrollView>

			{/* Sticky finish button */}
			<View style={styles.stickyFooter}>
				<TouchableOpacity
					style={[
						styles.finishBtn,
						{ backgroundColor: accentColor },
						finishing && styles.finishBtnDisabled,
					]}
					onPress={handleFinishPress}
					disabled={finishing}
				>
					<ThemedText style={styles.finishBtnText}>
						{finishing ? "Saving…" : "Finish Workout"}
					</ThemedText>
				</TouchableOpacity>
			</View>

			{/* Rest Timer overlay */}
			<RestTimerModal
				visible={restVisible}
				seconds={restSeconds}
				onDismiss={() => setRestVisible(false)}
			/>

			{/* ── Cancel Workout Modal ───────────────────────────────────────── */}
			<Modal visible={cancelModalVisible} transparent animationType="fade">
				<View style={styles.backdrop}>
					<TouchableOpacity
						style={StyleSheet.absoluteFillObject}
						activeOpacity={1}
						onPress={() => setCancelModalVisible(false)}
					/>
					<View style={[styles.modalCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
						<View style={[styles.modalIconWrap, { backgroundColor: dangerColor + "18" }]}>
							<Ionicons name="trash-outline" size={28} color={dangerColor} />
						</View>
						<ThemedText type="defaultSemiBold" style={styles.modalTitle}>
							Cancel Workout?
						</ThemedText>
						<ThemedText style={[styles.modalBody, { color: secondaryText }]}>
							All progress will be lost and this workout won't be saved.
						</ThemedText>
						<TouchableOpacity
							style={[styles.modalPrimaryBtn, { backgroundColor: dangerColor }]}
							onPress={() => {
								setCancelModalVisible(false);
								discardWorkout();
								router.replace("/(tabs)/workout");
							}}
						>
							<ThemedText style={styles.modalPrimaryBtnText}>Discard Workout</ThemedText>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.modalSecondaryBtn, { borderColor: cardBorder }]}
							onPress={() => setCancelModalVisible(false)}
						>
							<ThemedText style={[styles.modalSecondaryBtnText, { color: accentColor }]}>
								Keep Going
							</ThemedText>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* ── Finish with Incomplete Sets Modal ─────────────────────────── */}
			<Modal visible={incompleteModalVisible} transparent animationType="fade">
				<View style={styles.backdrop}>
					<TouchableOpacity
						style={StyleSheet.absoluteFillObject}
						activeOpacity={1}
						onPress={() => setIncompleteModalVisible(false)}
					/>
					<View style={[styles.modalCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
						<View style={[styles.modalIconWrap, { backgroundColor: accentColor + "18" }]}>
							<Ionicons name="checkmark-circle-outline" size={28} color={accentColor} />
						</View>
						<ThemedText type="defaultSemiBold" style={styles.modalTitle}>
							Finish Workout?
						</ThemedText>
						<ThemedText style={[styles.modalBody, { color: secondaryText }]}>
							Some sets aren't marked complete. Sets with data will be saved automatically — empty sets will be skipped.
						</ThemedText>
						<TouchableOpacity
							style={[styles.modalPrimaryBtn, { backgroundColor: accentColor }]}
							onPress={() => {
								setIncompleteModalVisible(false);
								doFinish();
							}}
						>
							<ThemedText style={styles.modalPrimaryBtnText}>Finish Workout</ThemedText>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.modalSecondaryBtn, { borderColor: cardBorder }]}
							onPress={() => setIncompleteModalVisible(false)}
						>
							<ThemedText style={[styles.modalSecondaryBtnText, { color: accentColor }]}>
								Keep Going
							</ThemedText>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 60,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingBottom: 14,
		borderBottomWidth: StyleSheet.hairlineWidth,
		marginBottom: 8,
	},
	headerLeft: {
		flex: 1,
		gap: 2,
	},
	workoutName: {
		fontSize: 20,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 20,
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
	finishBtn: {
		paddingVertical: 16,
		borderRadius: 14,
		alignItems: "center",
	},
	finishBtnDisabled: {
		opacity: 0.6,
	},
	finishBtnText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "700",
	},
	// ── Modal ────────────────────────────────────────────────────────────────
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
	},
	modalCard: {
		width: "100%",
		borderRadius: 20,
		padding: 24,
		alignItems: "center",
		gap: 8,
		borderWidth: 1,
	},
	modalIconWrap: {
		width: 56,
		height: 56,
		borderRadius: 28,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 4,
	},
	modalTitle: {
		fontSize: 18,
		textAlign: "center",
	},
	modalBody: {
		fontSize: 14,
		textAlign: "center",
		lineHeight: 20,
		marginBottom: 8,
	},
	modalPrimaryBtn: {
		width: "100%",
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: "center",
	},
	modalPrimaryBtnText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
	},
	modalSecondaryBtn: {
		width: "100%",
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: "center",
		borderWidth: 1,
	},
	modalSecondaryBtnText: {
		fontSize: 16,
		fontWeight: "600",
	},
});
