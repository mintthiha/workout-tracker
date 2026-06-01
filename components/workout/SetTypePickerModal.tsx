import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { AppModal } from "@/components/ui/AppModal";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SetType } from "@/src/types/workout";

const SET_TYPE_OPTIONS: {
	type: SetType;
	label: string;
	description: string;
	icon: string;
	color: string;
}[] = [
	{
		type: "normal",
		label: "Normal",
		description: "Standard working set",
		icon: "barbell-outline",
		color: "#6b7280",
	},
	{
		type: "warmup",
		label: "Warm-up",
		description: "Lower intensity, prepare muscles",
		icon: "flame-outline",
		color: "#3b82f6",
	},
	{
		type: "drop",
		label: "Drop Set",
		description: "Reduce weight and continue reps",
		icon: "trending-down-outline",
		color: "#f97316",
	},
	{
		type: "failure",
		label: "Failure",
		description: "Train to complete muscle failure",
		icon: "flash-outline",
		color: "#ef4444",
	},
];

interface Props {
	visible: boolean;
	current?: SetType;
	onSelect: (type: SetType) => void;
	onDismiss: () => void;
}

export function SetTypePickerModal({ visible, current = "normal", onSelect, onDismiss }: Props) {
	const glassDivider = useThemeColor({}, "glassDivider");
	const secondaryText = useThemeColor({}, "secondaryText");

	return (
		<AppModal visible={visible} onDismiss={onDismiss}>
			<View style={styles.header}>
				<ThemedText style={styles.title}>Set Type</ThemedText>
				<ThemedText style={[styles.subtitle, { color: secondaryText }]}>
					Classify this set for tracking
				</ThemedText>
			</View>
			<View style={[styles.separator, { backgroundColor: glassDivider }]} />
			{SET_TYPE_OPTIONS.map((item, i) => {
				const isSelected = current === item.type;
				const isLast = i === SET_TYPE_OPTIONS.length - 1;
				return (
					<TouchableOpacity
						key={item.type}
						style={[
							styles.option,
							!isLast && {
								borderBottomWidth: StyleSheet.hairlineWidth,
								borderBottomColor: glassDivider,
							},
							isSelected && { backgroundColor: item.color + "14" },
						]}
						onPress={() => {
							onSelect(item.type);
							onDismiss();
						}}
						activeOpacity={0.7}
					>
						<View style={[styles.iconWrap, { backgroundColor: item.color + "22" }]}>
							<Ionicons name={item.icon as any} size={20} color={item.color} />
						</View>
						<View style={styles.textGroup}>
							<ThemedText style={[styles.optionLabel, isSelected && { color: item.color }]}>
								{item.label}
							</ThemedText>
							<ThemedText style={[styles.optionDesc, { color: secondaryText }]}>
								{item.description}
							</ThemedText>
						</View>
						{isSelected && <Ionicons name="checkmark-circle" size={20} color={item.color} />}
					</TouchableOpacity>
				);
			})}
			<View style={styles.bottomPad} />
		</AppModal>
	);
}

const styles = StyleSheet.create({
	header: {
		paddingHorizontal: 22,
		paddingTop: 22,
		paddingBottom: 14,
		gap: 3,
	},
	title: {
		fontSize: 17,
		fontWeight: "700",
		letterSpacing: -0.3,
	},
	subtitle: {
		fontSize: 13,
	},
	separator: {
		height: StyleSheet.hairlineWidth,
		marginBottom: 4,
	},
	option: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 18,
		paddingVertical: 14,
		gap: 14,
	},
	iconWrap: {
		width: 40,
		height: 40,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	textGroup: {
		flex: 1,
		gap: 2,
	},
	optionLabel: {
		fontSize: 15,
		fontWeight: "600",
	},
	optionDesc: {
		fontSize: 12,
	},
	bottomPad: {
		height: 12,
	},
});
