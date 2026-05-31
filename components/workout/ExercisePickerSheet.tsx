import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
	Modal,
	SectionList,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { MuscleGroupColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAppContext } from "@/src/context/AppContext";
import { EXERCISE_LIBRARY, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ORDER } from "@/src/data/exerciseLibrary";
import * as exerciseService from "@/src/services/exerciseService";
import { Exercise } from "@/src/types/workout";

const EQUIPMENT_LABELS: Record<string, string> = {
	barbell: "Barbell",
	dumbbell: "Dumbbell",
	machine: "Machine",
	cable: "Cable",
	bodyweight: "Bodyweight",
	other: "Other",
};

interface Section {
	title: string;
	muscleGroup: string;
	data: Exercise[];
}

interface Props {
	visible: boolean;
	title: string;
	onSelect: (exercise: Exercise) => void;
	onDismiss: () => void;
}

export function ExercisePickerSheet({ visible, title, onSelect, onDismiss }: Props) {
	const { userId } = useAppContext();
	const [search, setSearch] = useState("");
	const [exercises, setExercises] = useState<Exercise[]>(EXERCISE_LIBRARY);
	const [customExercises, setCustomExercises] = useState<Exercise[]>([]);

	const scheme = useColorScheme();
	const bgColor = useThemeColor({}, "background");
	const glassDivider = useThemeColor({}, "glassDivider");
	const secondaryText = useThemeColor({}, "secondaryText");
	const inputBg = useThemeColor({}, "inputBg");
	const text = useThemeColor({}, "text");
	const primary = useThemeColor({}, "primary");
	const accentTint = useThemeColor({}, "accentTint");
	const muscleColorMap = MuscleGroupColors[scheme ?? "light"];

	useEffect(() => {
		if (!visible) return;
		setSearch("");
		exerciseService.getExercises().then(setExercises);
		if (userId) {
			exerciseService.getCustomExercises(userId).then(setCustomExercises);
		}
	}, [visible, userId]);

	const allExercises = [...customExercises, ...exercises];
	const q = search.trim().toLowerCase();
	const filtered = q
		? allExercises.filter((e) => e.name.toLowerCase().includes(q))
		: allExercises;

	const sections: Section[] = MUSCLE_GROUP_ORDER.map((g) => ({
		title: MUSCLE_GROUP_LABELS[g] ?? g,
		muscleGroup: g,
		data: filtered.filter((e) => e.muscleGroup === g),
	})).filter((s) => s.data.length > 0);

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
			onRequestClose={onDismiss}
		>
			<View style={[styles.container, { backgroundColor: bgColor }]}>
				{/* Header */}
				<View style={[styles.header, { borderBottomColor: glassDivider }]}>
					<ThemedText style={styles.headerTitle}>{title}</ThemedText>
					<TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
						<Ionicons name="close" size={22} color={secondaryText} />
					</TouchableOpacity>
				</View>

				{/* Search */}
				<View style={styles.searchRow}>
					<View style={[styles.searchBar, { backgroundColor: inputBg }]}>
						<Ionicons name="search-outline" size={16} color={secondaryText} />
						<TextInput
							style={[styles.searchInput, { color: text }]}
							placeholder="Search exercises…"
							placeholderTextColor={secondaryText}
							value={search}
							onChangeText={setSearch}
							returnKeyType="search"
							autoCorrect={false}
						/>
						{search.length > 0 && (
							<TouchableOpacity onPress={() => setSearch("")}>
								<Ionicons name="close-circle" size={16} color={secondaryText} />
							</TouchableOpacity>
						)}
					</View>
				</View>

				{/* Exercise list grouped by muscle */}
				<SectionList
					sections={sections}
					keyExtractor={(item) => item.id}
					stickySectionHeadersEnabled
					renderSectionHeader={({ section }) => {
						const colors = muscleColorMap[section.muscleGroup as keyof typeof muscleColorMap];
						return (
							<View style={[styles.sectionHeader, { backgroundColor: bgColor }]}>
								<View
									style={[styles.sectionBadge, { backgroundColor: colors?.bg ?? accentTint }]}
								>
									<ThemedText
										style={[styles.sectionTitle, { color: colors?.text ?? primary }]}
									>
										{section.title}
									</ThemedText>
								</View>
							</View>
						);
					}}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={[styles.row, { borderBottomColor: glassDivider }]}
							onPress={() => {
								onSelect(item);
								onDismiss();
							}}
							activeOpacity={0.7}
						>
							<View style={styles.rowInfo}>
								<ThemedText style={styles.rowName} numberOfLines={1}>
									{item.name}
								</ThemedText>
								<ThemedText style={[styles.rowEquip, { color: secondaryText }]}>
									{EQUIPMENT_LABELS[item.equipment] ?? item.equipment}
								</ThemedText>
							</View>
							<Ionicons name="add-circle-outline" size={22} color={primary} />
						</TouchableOpacity>
					)}
					contentContainerStyle={styles.listContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				/>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 20,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingBottom: 14,
		borderBottomWidth: 1,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "700",
		letterSpacing: -0.3,
	},
	closeBtn: {
		width: 32,
		height: 32,
		alignItems: "center",
		justifyContent: "center",
	},
	searchRow: {
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		gap: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 15,
		padding: 0,
	},
	sectionHeader: {
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 6,
	},
	sectionBadge: {
		alignSelf: "flex-start",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 8,
	},
	sectionTitle: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.5,
		textTransform: "uppercase",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 14,
		borderBottomWidth: StyleSheet.hairlineWidth,
		gap: 12,
	},
	rowInfo: {
		flex: 1,
		gap: 3,
	},
	rowName: {
		fontSize: 15,
		fontWeight: "500",
	},
	rowEquip: {
		fontSize: 12,
	},
	listContent: {
		paddingBottom: 40,
	},
});
