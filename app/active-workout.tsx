import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useState } from "react";
import {
	Alert,
	Modal,
	Platform,
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
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useWorkout } from "@/src/context/WorkoutContext";

export default function ActiveWorkoutScreen() {
	const { session, finishWorkout, discardWorkout } = useWorkout();
	const [restVisible, setRestVisible] = useState(false);
	const [restSeconds, setRestSeconds] = useState(90);
	const [finishing, setFinishing] = useState(false);
	const [cancelModalVisible, setCancelModalVisible] = useState(false);
	const [incompleteModalVisible, setIncompleteModalVisible] = useState(false);

	const scheme = useColorScheme();

	const primary = useThemeColor({}, "primary");
	const danger = useThemeColor({}, "danger");
	const dangerTint = useThemeColor({}, "dangerTint");
	const accentTint = useThemeColor({}, "accentTint");
	const secondaryText = useThemeColor({}, "secondaryText");
	const glassCard = useThemeColor({}, "glassCard");
	const glassBorder = useThemeColor({}, "glassBorder");
	const glassDivider = useThemeColor({}, "glassDivider");
	const subtleBtnBg = useThemeColor({}, "subtleBtnBg");

	if (!session) {
		router.replace("/(tabs)/workout");
		return null;
	}

	function handleSetCompleted(seconds: number) {
		setRestSeconds(seconds);
		setRestVisible(true);
	}

	async function doFinish() {
		const hasValidData = session.exercises.some((ex) => ex.sets.some((s) => s.actualReps > 0));
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
			<View style={[styles.header, { borderBottomColor: glassDivider }]}>
				<View style={styles.headerLeft}>
					<ThemedText style={styles.workoutName} numberOfLines={1}>
						{session.templateName}
					</ThemedText>
					<WorkoutTimer startedAt={session.startedAt} />
				</View>
				<TouchableOpacity
					style={[styles.cancelBtn, { backgroundColor: subtleBtnBg, borderColor: glassBorder }]}
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

			{/* Cancel Workout Modal */}
			<Modal visible={cancelModalVisible} transparent animationType="fade">
				<View style={styles.backdrop}>
					<TouchableOpacity
						style={StyleSheet.absoluteFillObject}
						activeOpacity={1}
						onPress={() => setCancelModalVisible(false)}
					/>
					{Platform.OS === "ios" ? (
						<BlurView
							intensity={60}
							tint={scheme === "dark" ? "dark" : "light"}
							style={styles.modalCard}
						>
							<ModalContent
								iconName="trash-outline"
								iconColor={danger}
								iconBg={dangerTint}
								title="Cancel Workout?"
								body="All progress will be lost and this workout won't be saved."
								primaryLabel="Discard Workout"
								primaryColor={danger}
								secondaryLabel="Keep Going"
								secondaryColor={primary}
								cardBorder={glassBorder}
								secondaryText={secondaryText}
								onPrimary={() => {
									setCancelModalVisible(false);
									discardWorkout();
									router.replace("/(tabs)/workout");
								}}
								onSecondary={() => setCancelModalVisible(false)}
							/>
						</BlurView>
					) : (
						<View
							style={[
								styles.modalCard,
								{ backgroundColor: glassCard, borderColor: glassBorder, borderWidth: 1 },
							]}
						>
							<ModalContent
								iconName="trash-outline"
								iconColor={danger}
								iconBg={dangerTint}
								title="Cancel Workout?"
								body="All progress will be lost and this workout won't be saved."
								primaryLabel="Discard Workout"
								primaryColor={danger}
								secondaryLabel="Keep Going"
								secondaryColor={primary}
								cardBorder={glassBorder}
								secondaryText={secondaryText}
								onPrimary={() => {
									setCancelModalVisible(false);
									discardWorkout();
									router.replace("/(tabs)/workout");
								}}
								onSecondary={() => setCancelModalVisible(false)}
							/>
						</View>
					)}
				</View>
			</Modal>

			{/* Finish with Incomplete Sets Modal */}
			<Modal visible={incompleteModalVisible} transparent animationType="fade">
				<View style={styles.backdrop}>
					<TouchableOpacity
						style={StyleSheet.absoluteFillObject}
						activeOpacity={1}
						onPress={() => setIncompleteModalVisible(false)}
					/>
					{Platform.OS === "ios" ? (
						<BlurView
							intensity={60}
							tint={scheme === "dark" ? "dark" : "light"}
							style={styles.modalCard}
						>
							<ModalContent
								iconName="checkmark-circle-outline"
								iconColor={primary}
								iconBg={accentTint}
								title="Finish Workout?"
								body="Some sets aren't marked complete. Sets with data will be saved — empty sets will be skipped."
								primaryLabel="Finish Workout"
								primaryColor={primary}
								secondaryLabel="Keep Going"
								secondaryColor={primary}
								cardBorder={glassBorder}
								secondaryText={secondaryText}
								onPrimary={() => {
									setIncompleteModalVisible(false);
									doFinish();
								}}
								onSecondary={() => setIncompleteModalVisible(false)}
							/>
						</BlurView>
					) : (
						<View
							style={[
								styles.modalCard,
								{ backgroundColor: glassCard, borderColor: glassBorder, borderWidth: 1 },
							]}
						>
							<ModalContent
								iconName="checkmark-circle-outline"
								iconColor={primary}
								iconBg={accentTint}
								title="Finish Workout?"
								body="Some sets aren't marked complete. Sets with data will be saved — empty sets will be skipped."
								primaryLabel="Finish Workout"
								primaryColor={primary}
								secondaryLabel="Keep Going"
								secondaryColor={primary}
								cardBorder={glassBorder}
								secondaryText={secondaryText}
								onPrimary={() => {
									setIncompleteModalVisible(false);
									doFinish();
								}}
								onSecondary={() => setIncompleteModalVisible(false)}
							/>
						</View>
					)}
				</View>
			</Modal>
		</ThemedView>
	);
}

function ModalContent({
	iconName,
	iconColor,
	iconBg,
	title,
	body,
	primaryLabel,
	primaryColor,
	secondaryLabel,
	secondaryColor,
	cardBorder,
	secondaryText,
	onPrimary,
	onSecondary,
}: {
	iconName: string;
	iconColor: string;
	iconBg: string;
	title: string;
	body: string;
	primaryLabel: string;
	primaryColor: string;
	secondaryLabel: string;
	secondaryColor: string;
	cardBorder: string;
	secondaryText: string;
	onPrimary: () => void;
	onSecondary: () => void;
}) {
	return (
		<>
			<View style={[styles.modalIconWrap, { backgroundColor: iconBg }]}>
				<Ionicons name={iconName as any} size={30} color={iconColor} />
			</View>
			<ThemedText style={styles.modalTitle}>{title}</ThemedText>
			<ThemedText style={[styles.modalBody, { color: secondaryText }]}>{body}</ThemedText>
			<TouchableOpacity
				style={[styles.modalPrimaryBtn, { backgroundColor: primaryColor }]}
				onPress={onPrimary}
			>
				<ThemedText style={styles.modalPrimaryBtnText}>{primaryLabel}</ThemedText>
			</TouchableOpacity>
			<TouchableOpacity
				style={[styles.modalSecondaryBtn, { borderColor: cardBorder }]}
				onPress={onSecondary}
			>
				<ThemedText style={[styles.modalSecondaryBtnText, { color: secondaryColor }]}>
					{secondaryLabel}
				</ThemedText>
			</TouchableOpacity>
		</>
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
	headerLeft: {
		flex: 1,
		gap: 3,
	},
	workoutName: {
		fontSize: 20,
		fontWeight: "700",
		letterSpacing: -0.3,
	},
	cancelBtn: {
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
		height: 110,
	},
	stickyFooter: {
		position: "absolute",
		bottom: 34,
		left: 16,
		right: 16,
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
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.55)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
	},
	modalCard: {
		width: "100%",
		borderRadius: 24,
		padding: 28,
		alignItems: "center",
		gap: 10,
		overflow: "hidden",
	},
	modalIconWrap: {
		width: 60,
		height: 60,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 4,
	},
	modalTitle: {
		fontSize: 19,
		fontWeight: "700",
		textAlign: "center",
		letterSpacing: -0.3,
	},
	modalBody: {
		fontSize: 14,
		textAlign: "center",
		lineHeight: 20,
		marginBottom: 6,
	},
	modalPrimaryBtn: {
		width: "100%",
		paddingVertical: 15,
		borderRadius: 14,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
	},
	modalPrimaryBtnText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
	},
	modalSecondaryBtn: {
		width: "100%",
		paddingVertical: 15,
		borderRadius: 14,
		alignItems: "center",
		borderWidth: 1,
	},
	modalSecondaryBtnText: {
		fontSize: 16,
		fontWeight: "600",
	},
});
