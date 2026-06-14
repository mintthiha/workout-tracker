import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AlertModal } from "@/components/ui/AlertModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ActiveExerciseCard } from "@/components/workout/ActiveExerciseCard";
import { ExercisePickerSheet } from "@/components/workout/ExercisePickerSheet";
import { RestTimerModal } from "@/components/workout/RestTimerModal";
import { WorkoutTimer } from "@/components/workout/WorkoutTimer";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useWorkout } from "@/src/context/WorkoutContext";
import { Exercise } from "@/src/types/workout";

export default function ActiveWorkoutScreen() {
	const { session, finishWorkout, discardWorkout, addExercise } = useWorkout();
	const [restVisible, setRestVisible] = useState(false);
	const [restSeconds, setRestSeconds] = useState(90);
	const [finishing, setFinishing] = useState(false);
	const [cancelModalVisible, setCancelModalVisible] = useState(false);
	const [incompleteModalVisible, setIncompleteModalVisible] = useState(false);
	const [showAddExercise, setShowAddExercise] = useState(false);
	const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; body: string }>({
		visible: false,
		title: "",
		body: "",
	});

	const primary = useThemeColor({}, "primary");
	const danger = useThemeColor({}, "danger");
	const dangerTint = useThemeColor({}, "dangerTint");
	const accentTint = useThemeColor({}, "accentTint");
	const secondaryText = useThemeColor({}, "secondaryText");
	const glassBorder = useThemeColor({}, "glassBorder");
	const glassDivider = useThemeColor({}, "glassDivider");
	const subtleBtnBg = useThemeColor({}, "subtleBtnBg");

	// Redirect after render, not during — calling router during render updates NavigationContainerInner's
	// state while this component is still rendering, which React forbids.
	useEffect(() => {
		if (!session) {
			router.replace("/(tabs)/workout");
		}
	}, [session]);

	if (!session) {
		return null;
	}

	function handleSetCompleted(seconds: number) {
		setRestSeconds(seconds);
		setRestVisible(true);
	}

	async function doFinish() {
		const hasValidData = session.exercises.some((ex) => ex.sets.some((s) => s.actualReps > 0));
		if (!hasValidData) {
			setAlertConfig({
				visible: true,
				title: "No Data Entered",
				body: "Please enter reps for at least one set before finishing.",
			});
			return;
		}
		setFinishing(true);
		try {
			await finishWorkout();
			router.replace("/workout-complete");
		} catch {
			setAlertConfig({
				visible: true,
				title: "Error",
				body: "Failed to save workout. Please try again.",
			});
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

	function handleAddExercise(exercise: Exercise) {
		addExercise(exercise);
	}

	return (
		<ThemedView style={styles.container}>
			{/* Header */}
			<View style={[styles.header, { borderBottomColor: glassDivider }]}>
				<TouchableOpacity
					style={[styles.iconBtn, { backgroundColor: subtleBtnBg, borderColor: glassBorder }]}
					onPress={() => {
						if (router.canGoBack()) router.back();
						else router.replace("/(tabs)/workout");
					}}
				>
					<Ionicons name="chevron-down" size={20} color={secondaryText} />
				</TouchableOpacity>

				<View style={styles.headerCenter}>
					<ThemedText style={styles.workoutName} numberOfLines={1}>
						{session.templateName}
					</ThemedText>
					<WorkoutTimer startedAt={session.startedAt} />
				</View>

				<TouchableOpacity
					style={[styles.iconBtn, { backgroundColor: subtleBtnBg, borderColor: glassBorder }]}
					onPress={() => setCancelModalVisible(true)}
				>
					<Ionicons name="close" size={18} color={secondaryText} />
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
						key={exercise.id}
						exercise={exercise}
						exerciseIdx={idx}
						onSetCompleted={handleSetCompleted}
					/>
				))}
				<View style={styles.bottomSpacer} />
			</ScrollView>

			{/* Sticky footer */}
			<View style={styles.stickyFooter}>
				<TouchableOpacity
					style={[
						styles.addExerciseBtn,
						{ borderColor: glassBorder, backgroundColor: subtleBtnBg },
					]}
					onPress={() => setShowAddExercise(true)}
				>
					<Ionicons name="add-circle-outline" size={18} color={primary} />
					<ThemedText style={[styles.addExerciseBtnText, { color: primary }]}>
						Add Exercise
					</ThemedText>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.finishBtn,
						{ backgroundColor: primary },
						finishing && styles.finishBtnDisabled,
					]}
					onPress={handleFinishPress}
					disabled={finishing}
				>
					{!finishing && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
					<ThemedText style={styles.finishBtnText}>
						{finishing ? "Saving…" : "Finish Workout"}
					</ThemedText>
				</TouchableOpacity>
			</View>

			<RestTimerModal
				visible={restVisible}
				seconds={restSeconds}
				onDismiss={() => setRestVisible(false)}
			/>

			<ConfirmModal
				visible={cancelModalVisible}
				onDismiss={() => setCancelModalVisible(false)}
				icon="trash-outline"
				iconColor={danger}
				iconBg={dangerTint}
				title="Cancel Workout?"
				body="All progress will be lost and this workout won't be saved."
				primaryLabel="Discard Workout"
				primaryColor={danger}
				secondaryLabel="Keep Going"
				onPrimary={() => {
					setCancelModalVisible(false);
					discardWorkout();
					router.replace("/(tabs)/workout");
				}}
				onSecondary={() => setCancelModalVisible(false)}
			/>

			<ConfirmModal
				visible={incompleteModalVisible}
				onDismiss={() => setIncompleteModalVisible(false)}
				icon="checkmark-circle-outline"
				iconColor={primary}
				iconBg={accentTint}
				title="Finish Workout?"
				body="Some sets aren't marked complete. Sets with data will be saved — empty sets will be skipped."
				primaryLabel="Finish Workout"
				primaryColor={primary}
				secondaryLabel="Keep Going"
				onPrimary={() => {
					setIncompleteModalVisible(false);
					doFinish();
				}}
				onSecondary={() => setIncompleteModalVisible(false)}
			/>

			<ExercisePickerSheet
				visible={showAddExercise}
				title="Add Exercise"
				onSelect={handleAddExercise}
				onDismiss={() => setShowAddExercise(false)}
			/>

			<AlertModal
				visible={alertConfig.visible}
				onDismiss={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
				title={alertConfig.title}
				body={alertConfig.body}
				icon="alert-circle-outline"
				iconColor={danger}
				iconBg={dangerTint}
			/>
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
		borderBottomWidth: 1,
		marginBottom: 8,
	},
	headerCenter: {
		flex: 1,
		alignItems: "center",
		gap: 3,
		paddingHorizontal: 8,
	},
	workoutName: {
		fontSize: 18,
		fontWeight: "700",
		letterSpacing: -0.3,
		textAlign: "center",
	},
	iconBtn: {
		width: 36,
		height: 36,
		borderRadius: 11,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
	},
	scrollContent: {
		paddingHorizontal: 14,
		paddingTop: 8,
		paddingBottom: 20,
	},
	bottomSpacer: {
		height: 150,
	},
	stickyFooter: {
		position: "absolute",
		bottom: 34,
		left: 16,
		right: 16,
		gap: 8,
	},
	addExerciseBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 13,
		borderRadius: 14,
		borderWidth: 1,
	},
	addExerciseBtnText: {
		fontSize: 16,
		fontWeight: "600",
	},
	finishBtn: {
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
	finishBtnDisabled: {
		opacity: 0.6,
	},
	finishBtnText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "700",
		letterSpacing: -0.2,
	},
});
