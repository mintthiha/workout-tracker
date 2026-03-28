import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { MuscleGroupColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MUSCLE_GROUP_LABELS } from "@/src/data/exerciseLibrary";
import { WorkoutTemplate } from "@/src/types/workout";

interface Props {
	template: WorkoutTemplate;
	onPress: () => void;
	onLongPress: () => void;
}

export function TemplateCard({ template, onPress, onLongPress }: Props) {
	const scheme = useColorScheme();
	const muscleColorMap = MuscleGroupColors[scheme];

	const cardBg = useThemeColor({}, "glassCard");
	const cardBorder = useThemeColor({}, "glassBorder");
	const secondaryText = useThemeColor({}, "secondaryText");
	const primary = useThemeColor({}, "primary");
	const accentTint = useThemeColor({}, "accentTint");

	const uniqueMuscleGroups = [...new Set(template.exercises.map((e) => e.muscleGroup))];

	return (
		<TouchableOpacity
			style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
			onPress={onPress}
			onLongPress={onLongPress}
			activeOpacity={0.75}
		>
			<View style={styles.topRow}>
				<View style={styles.nameBlock}>
					<ThemedText style={styles.name} numberOfLines={1}>
						{template.name}
					</ThemedText>
					<View style={styles.metaRow}>
						<Ionicons name="layers-outline" size={12} color={secondaryText} />
						<ThemedText style={[styles.meta, { color: secondaryText }]}>
							{template.exercises.length} exercise
							{template.exercises.length !== 1 ? "s" : ""}
						</ThemedText>
					</View>
				</View>
				<View style={[styles.arrowWrap, { backgroundColor: accentTint }]}>
					<Ionicons name="chevron-forward" size={16} color={primary} />
				</View>
			</View>

			{uniqueMuscleGroups.length > 0 && (
				<View style={styles.pillRow}>
					{uniqueMuscleGroups.map((g) => {
						const colors = muscleColorMap[g as keyof typeof muscleColorMap] ?? {
							bg: accentTint,
							text: primary,
						};
						return (
							<View key={g} style={[styles.pill, { backgroundColor: colors.bg }]}>
								<ThemedText style={[styles.pillText, { color: colors.text }]}>
									{MUSCLE_GROUP_LABELS[g] ?? g}
								</ThemedText>
							</View>
						);
					})}
				</View>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 18,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.12,
		shadowRadius: 14,
		elevation: 3,
	},
	topRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	nameBlock: {
		flex: 1,
		gap: 4,
	},
	name: {
		fontSize: 17,
		fontWeight: "700",
		letterSpacing: -0.3,
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
	},
	meta: {
		fontSize: 13,
	},
	arrowWrap: {
		width: 34,
		height: 34,
		borderRadius: 11,
		alignItems: "center",
		justifyContent: "center",
	},
	pillRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
		marginTop: 12,
	},
	pill: {
		paddingHorizontal: 9,
		paddingVertical: 4,
		borderRadius: 20,
	},
	pillText: {
		fontSize: 11,
		fontWeight: "600",
	},
});
