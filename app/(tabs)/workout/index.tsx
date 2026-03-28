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

	if (isLoaded && !userId) return <Redirect href="/login" />;

	const accentColor = useThemeColor({ light: "#3498db", dark: "#3498db" }, "accent");
	const secondaryText = useThemeColor({ light: "#666666", dark: "#8e8e93" }, "secondaryText");
	const tertiaryText = useThemeColor({ light: "#999999", dark: "#666666" }, "tertiaryText");

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
										// No manual setTemplates needed — the onSnapshot listener
										// will update the list automatically.
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
				<ThemedText type="title" style={styles.headerTitle}>
					Workout
				</ThemedText>
				<TouchableOpacity
					onPress={() => router.push("/workout/create")}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Ionicons name="add-circle-outline" size={28} color={accentColor} />
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				{templates.length === 0 ? (
					<View style={styles.emptyState}>
						<Ionicons name="barbell-outline" size={60} color={tertiaryText} />
						<ThemedText style={[styles.emptyTitle, { color: secondaryText }]}>
							No Templates Yet
						</ThemedText>
						<ThemedText style={[styles.emptySubtitle, { color: tertiaryText }]}>
							Create your first workout template to get started.
						</ThemedText>
						<TouchableOpacity
							style={[styles.emptyButton, { borderColor: accentColor }]}
							onPress={() => router.push("/workout/create")}
						>
							<ThemedText style={[styles.emptyButtonText, { color: accentColor }]}>
								+ Create Template
							</ThemedText>
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
		marginBottom: 20,
	},
	headerTitle: {
		fontSize: 34,
		fontWeight: "800",
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 40,
	},
	emptyState: {
		alignItems: "center",
		paddingTop: 80,
		gap: 12,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "600",
		marginTop: 8,
	},
	emptySubtitle: {
		fontSize: 15,
		textAlign: "center",
		paddingHorizontal: 32,
	},
	emptyButton: {
		marginTop: 16,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 10,
		borderWidth: 1.5,
	},
	emptyButtonText: {
		fontSize: 16,
		fontWeight: "600",
	},
});
