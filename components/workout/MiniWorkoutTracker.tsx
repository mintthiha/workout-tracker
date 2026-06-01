import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import React, { useContext } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { WorkoutTimer } from "@/components/workout/WorkoutTimer";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useWorkout } from "@/src/context/WorkoutContext";

export function MiniWorkoutTracker() {
	const { session } = useWorkout();
	const insets = useSafeAreaInsets();
	const tabHeight = useContext(BottomTabBarHeightContext);
	const tabBarHeight = tabHeight ?? (insets.bottom + 50);

	const glassCard = useThemeColor({}, "glassCard");
	const glassBorder = useThemeColor({}, "glassBorder");
	const primary = useThemeColor({}, "primary");
	const secondaryText = useThemeColor({}, "secondaryText");
	const background = useThemeColor({}, "background");

	if (!session) return null;

	return (
		<TouchableOpacity
			style={[
				styles.container,
				{
					bottom: tabBarHeight + 8,
					backgroundColor: glassCard,
					borderColor: glassBorder,
				},
			]}
			activeOpacity={0.8}
			onPress={() => router.push("/active-workout")}
		>
			<View style={styles.content}>
				<View style={styles.leftGroup}>
					<View style={[styles.iconWrap, { backgroundColor: background }]}>
						<Ionicons name="barbell" size={20} color={primary} />
					</View>
					<View style={styles.textGroup}>
						<ThemedText style={styles.title} numberOfLines={1}>
							{session.templateName}
						</ThemedText>
						<WorkoutTimer startedAt={session.startedAt} style={styles.timerText} />
					</View>
				</View>
				<Ionicons name="chevron-up" size={20} color={secondaryText} />
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		left: 12,
		right: 12,
		borderRadius: 16,
		borderWidth: 1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 5,
		overflow: "hidden",
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	leftGroup: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		flex: 1,
	},
	iconWrap: {
		width: 36,
		height: 36,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	textGroup: {
		flex: 1,
		justifyContent: "center",
		gap: 2,
	},
	title: {
		fontSize: 15,
		fontWeight: "700",
		letterSpacing: -0.2,
	},
	timerText: {
		fontSize: 13,
		fontWeight: "600",
	},
});
