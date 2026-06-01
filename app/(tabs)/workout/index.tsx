import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AlertModal } from "@/components/ui/AlertModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { OptionItem, OptionsModal } from "@/components/ui/OptionsModal";
import { TemplateCard } from "@/components/workout/TemplateCard";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAppContext } from "@/src/context/AppContext";
import * as workoutService from "@/src/services/workoutService";
import { WorkoutTemplate } from "@/src/types/workout";

export default function WorkoutScreen() {
	const { userId, isLoaded } = useAppContext();
	const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);

	const [activeTemplate, setActiveTemplate] = useState<WorkoutTemplate | null>(null);
	const [showOptions, setShowOptions] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; body: string }>({
		visible: false,
		title: "",
		body: "",
	});

	const primary = useThemeColor({}, "primary");
	const secondaryText = useThemeColor({}, "secondaryText");
	const tertiaryText = useThemeColor({}, "tertiaryText");
	const accentTint = useThemeColor({}, "accentTint");
	const danger = useThemeColor({}, "danger");
	const dangerTint = useThemeColor({}, "dangerTint");
	const text = useThemeColor({}, "text");

	useEffect(() => {
		if (!userId) {
			setTemplates([]);
			return;
		}
		const unsubscribe = workoutService.subscribeToTemplates(userId, setTemplates, () => {});
		return unsubscribe;
	}, [userId]);

	const handleLongPress = useCallback((template: WorkoutTemplate) => {
		setActiveTemplate(template);
		setShowOptions(true);
	}, []);

	async function doDeleteTemplate() {
		if (!userId || !activeTemplate) return;
		try {
			await workoutService.deleteTemplate(userId, activeTemplate.id);
		} catch {
			setAlertConfig({
				visible: true,
				title: "Error",
				body: "Failed to delete template. Please try again.",
			});
		}
	}

	const TEMPLATE_OPTIONS: OptionItem[] = [
		{
			id: "edit",
			label: "Edit Template",
			description: "Modify exercises and details",
			icon: "pencil-outline",
			color: text,
			onPress: () => {
				if (activeTemplate) {
					router.push(`/workout/create?id=${activeTemplate.id}`);
				}
			},
		},
		{
			id: "delete",
			label: "Delete Template",
			description: "Remove this template permanently",
			icon: "trash-outline",
			color: danger,
			onPress: () => setShowDeleteConfirm(true),
		},
	];

	if (isLoaded && !userId) return <Redirect href="/login" />;

	return (
		<ThemedView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<View>
					<ThemedText style={[styles.headerEyebrow, { color: tertiaryText }]}>
						My
					</ThemedText>
					<ThemedText style={styles.headerTitle}>Workouts</ThemedText>
				</View>
				<TouchableOpacity
					style={[styles.addBtn, { backgroundColor: primary }]}
					onPress={() => router.push("/workout/create")}
					hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
				>
					<Ionicons name="add" size={24} color="#fff" />
				</TouchableOpacity>
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{templates.length === 0 ? (
					<View style={styles.emptyState}>
						<View style={[styles.emptyIconWrap, { backgroundColor: accentTint }]}>
							<Ionicons name="barbell-outline" size={48} color={primary} />
						</View>
						<ThemedText style={styles.emptyTitle}>No Templates Yet</ThemedText>
						<ThemedText style={[styles.emptySubtitle, { color: secondaryText }]}>
							Build your first workout template and start tracking your gains.
						</ThemedText>
						<TouchableOpacity
							style={[styles.emptyButton, { backgroundColor: primary }]}
							onPress={() => router.push("/workout/create")}
						>
							<Ionicons name="add" size={18} color="#fff" />
							<ThemedText style={styles.emptyButtonText}>Create Template</ThemedText>
						</TouchableOpacity>
					</View>
				) : (
					<>
						<ThemedText style={[styles.listLabel, { color: tertiaryText }]}>
							{templates.length} template{templates.length !== 1 ? "s" : ""}
						</ThemedText>
						{templates.map((template) => (
							<TemplateCard
								key={template.id}
								template={template}
								onPress={() => router.push(`/workout/${template.id}`)}
								onLongPress={() => handleLongPress(template)}
							/>
						))}
					</>
				)}
			</ScrollView>

			<OptionsModal
				visible={showOptions}
				title={activeTemplate?.name || "Template"}
				subtitle="Template Options"
				options={TEMPLATE_OPTIONS}
				onDismiss={() => setShowOptions(false)}
			/>

			<ConfirmModal
				visible={showDeleteConfirm}
				onDismiss={() => setShowDeleteConfirm(false)}
				icon="trash-outline"
				iconColor={danger}
				iconBg={dangerTint}
				title="Delete Template"
				body={`Are you sure you want to delete "${activeTemplate?.name}"?`}
				primaryLabel="Delete"
				primaryColor={danger}
				secondaryLabel="Cancel"
				onPrimary={() => {
					setShowDeleteConfirm(false);
					doDeleteTemplate();
				}}
				onSecondary={() => setShowDeleteConfirm(false)}
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
		alignItems: "flex-end",
		paddingHorizontal: 20,
		marginBottom: 24,
	},
	headerEyebrow: {
		fontSize: 13,
		fontWeight: "600",
		letterSpacing: 0.5,
		textTransform: "uppercase",
	},
	headerTitle: {
		fontSize: 36,
		fontWeight: "800",
		letterSpacing: -0.8,
		marginTop: 2,
	},
	addBtn: {
		width: 44,
		height: 44,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 10,
		elevation: 5,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 48,
	},
	listLabel: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.8,
		textTransform: "uppercase",
		marginBottom: 12,
		marginLeft: 4,
	},
	emptyState: {
		alignItems: "center",
		paddingTop: 80,
		gap: 14,
	},
	emptyIconWrap: {
		width: 96,
		height: 96,
		borderRadius: 30,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	emptyTitle: {
		fontSize: 22,
		fontWeight: "700",
		letterSpacing: -0.4,
	},
	emptySubtitle: {
		fontSize: 15,
		textAlign: "center",
		paddingHorizontal: 40,
		lineHeight: 22,
	},
	emptyButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginTop: 8,
		paddingHorizontal: 28,
		paddingVertical: 15,
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 10,
		elevation: 4,
	},
	emptyButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
	},
});
