import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TemplateCard } from "@/components/workout/TemplateCard";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAppContext } from "@/src/context/AppContext";
import * as workoutService from "@/src/services/workoutService";
import { WorkoutTemplate } from "@/src/types/workout";

export default function WorkoutScreen() {
	const { userId, isLoaded } = useAppContext();
	const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);

	// All hooks must run before any conditional return.
	const accentColor = useThemeColor({ light: "#3498db", dark: "#3498db" }, "accent");
	const secondaryText = useThemeColor({ light: "#666666", dark: "#8e8e93" }, "secondaryText");
	const tertiaryText = useThemeColor({ light: "#999999", dark: "#666666" }, "tertiaryText");
	const dividerColor = useThemeColor({ light: "#f0f0f0", dark: "#2c2c2e" }, "cardBorder");

	if (isLoaded && !userId) return <Redirect href="/login" />;

	// Real-time listener — updates instantly on any create, edit, or delete.
	useEffect(() => {
		if (!userId) {
			setTemplates([]);
			return;
		}
		const unsubscribe = workoutService.subscribeToTemplates(
			userId,
			setTemplates,
			() => {}, // silently ignore listener errors; stale data is acceptable
		);
		return unsubscribe;
	}, [userId]);

	const handleLongPress = useCallback(
		(template: WorkoutTemplate) => {
			Alert.alert(template.name, undefined, [
				{
					text: "Edit",
					onPress: () => router.push(`/workout/create?id=${template.id}`),
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: () =>
						Alert.alert("Delete Template", `Delete "${template.name}"?`, [
							{ text: "Cancel", style: "cancel" },
							{
								text: "Delete",
								style: "destructive",
								onPress: async () => {
									if (!userId) return;
									try {
										await workoutService.deleteTemplate(userId, template.id);
									} catch {
										Alert.alert(
											"Error",
											"Failed to delete template. Please try again.",
										);
									}
								},
							},
						]),
				},
				{ text: "Cancel", style: "cancel" },
			]);
		},
		[userId],
	);

	return (
		<ThemedView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<View>
					<ThemedText type="title" style={styles.headerTitle}>
						Workout
					</ThemedText>
					<ThemedText style={[styles.headerSubtitle, { color: secondaryText }]}>
						{templates.length > 0
							? `${templates.length} template${templates.length !== 1 ? "s" : ""}`
							: "Build your routine"}
					</ThemedText>
				</View>
				<TouchableOpacity
					style={[styles.addButton, { backgroundColor: accentColor }]}
					onPress={() => router.push("/workout/create")}
					hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
				>
					<Ionicons name="add" size={20} color="#fff" />
					<ThemedText style={styles.addButtonText}>New</ThemedText>
				</TouchableOpacity>
			</View>

			{templates.length > 0 && (
				<View style={[styles.sectionHeader, { borderBottomColor: dividerColor }]}>
					<ThemedText style={[styles.sectionLabel, { color: secondaryText }]}>
						MY TEMPLATES
					</ThemedText>
				</View>
			)}

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{templates.length === 0 ? (
					<View style={styles.emptyState}>
						<View style={[styles.emptyIconWrapper, { borderColor: dividerColor }]}>
							<Ionicons name="barbell-outline" size={44} color={tertiaryText} />
						</View>
						<ThemedText style={[styles.emptyTitle, { color: secondaryText }]}>
							No Templates Yet
						</ThemedText>
						<ThemedText style={[styles.emptySubtitle, { color: tertiaryText }]}>
							Create a workout template to build your routine and track progress.
						</ThemedText>
						<TouchableOpacity
							style={[styles.emptyButton, { backgroundColor: accentColor }]}
							onPress={() => router.push("/workout/create")}
						>
							<Ionicons name="add" size={18} color="#fff" />
							<ThemedText style={styles.emptyButtonText}>Create Template</ThemedText>
						</TouchableOpacity>
					</View>
				) : (
					templates.map((template) => (
						<TemplateCard
							key={template.id}
							template={template}
							onPress={() => router.push(`/workout/${template.id}`)}
							onLongPress={() => handleLongPress(template)}
						/>
					))
				)}
			</ScrollView>
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
		alignItems: "flex-end",
		paddingHorizontal: 20,
		marginBottom: 16,
	},
	headerTitle: {
		fontSize: 34,
		fontWeight: "800",
	},
	headerSubtitle: {
		fontSize: 14,
		marginTop: 2,
	},
	addButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 20,
	},
	addButtonText: {
		color: "#fff",
		fontSize: 15,
		fontWeight: "600",
	},
	sectionHeader: {
		paddingHorizontal: 20,
		paddingBottom: 10,
		borderBottomWidth: StyleSheet.hairlineWidth,
		marginBottom: 12,
	},
	sectionLabel: {
		fontSize: 12,
		fontWeight: "600",
		letterSpacing: 0.8,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 40,
	},
	emptyState: {
		alignItems: "center",
		paddingTop: 60,
		gap: 12,
	},
	emptyIconWrapper: {
		width: 88,
		height: 88,
		borderRadius: 44,
		borderWidth: 1.5,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 4,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "600",
	},
	emptySubtitle: {
		fontSize: 15,
		textAlign: "center",
		paddingHorizontal: 36,
		lineHeight: 22,
	},
	emptyButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginTop: 8,
		paddingHorizontal: 24,
		paddingVertical: 13,
		borderRadius: 24,
	},
	emptyButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
