import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ActiveSet } from "@/src/types/workout";

interface Props {
	set: ActiveSet;
	setNumber: number;
	onWeightChange: (value: number) => void;
	onRepsChange: (value: number) => void;
	onToggleComplete: () => void;
	onRemove: () => void;
}

export function SetRow({
	set,
	setNumber,
	onWeightChange,
	onRepsChange,
	onToggleComplete,
	onRemove,
}: Props) {
	const completedBg = useThemeColor({ light: "#edfaef", dark: "#1a2e1d" }, "card");
	const defaultBg = useThemeColor({ light: "transparent", dark: "transparent" }, "background");
	const cardBorder = useThemeColor({ light: "#e0e0e0", dark: "#2c2c2e" }, "cardBorder");
	const textColor = useThemeColor({ light: "#11181C", dark: "#ECEDEE" }, "text");
	const secondaryText = useThemeColor({ light: "#666666", dark: "#8e8e93" }, "secondaryText");
	const inputBg = useThemeColor({ light: "#f0f0f0", dark: "#3a3a3c" }, "card");
	const completedGreen = useThemeColor({ light: "#34c759", dark: "#30d158" }, "tint");

	const rowBg = set.completed ? completedBg : defaultBg;

	return (
		<View style={[styles.row, { backgroundColor: rowBg, borderTopColor: cardBorder }]}>
			{/* Set number */}
			<TouchableOpacity onLongPress={onRemove} style={styles.setNumCell}>
				<ThemedText style={[styles.setNum, { color: secondaryText }]}>
					{setNumber}
				</ThemedText>
			</TouchableOpacity>

			{/* Previous (placeholder for future history integration) */}
			<View style={styles.prevCell}>
				<ThemedText style={[styles.prevText, { color: secondaryText }]}>
					{set.targetWeight > 0 ? `${set.targetWeight} × ${set.targetReps}` : "—"}
				</ThemedText>
			</View>

			{/* Weight input */}
			<View style={styles.inputCell}>
				<TextInput
					style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
					value={set.actualWeight === 0 ? "" : String(set.actualWeight)}
					onChangeText={(t) => {
						const n = parseFloat(t);
						onWeightChange(isNaN(n) ? 0 : n);
					}}
					keyboardType="numeric"
					returnKeyType="done"
					maxLength={6}
					placeholder="0"
					placeholderTextColor={secondaryText}
					selectTextOnFocus
				/>
			</View>

			{/* Reps input */}
			<View style={styles.inputCell}>
				<TextInput
					style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
					value={set.actualReps === 0 ? "" : String(set.actualReps)}
					onChangeText={(t) => {
						const n = parseInt(t, 10);
						onRepsChange(isNaN(n) ? 0 : n);
					}}
					keyboardType="numeric"
					returnKeyType="done"
					maxLength={3}
					placeholder="0"
					placeholderTextColor={secondaryText}
					selectTextOnFocus
				/>
			</View>

			{/* Checkmark */}
			<TouchableOpacity style={styles.checkCell} onPress={onToggleComplete}>
				<View
					style={[
						styles.checkBox,
						set.completed && {
							backgroundColor: completedGreen,
							borderColor: completedGreen,
						},
						!set.completed && { borderColor: secondaryText },
					]}
				>
					{set.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
				</View>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		borderTopWidth: StyleSheet.hairlineWidth,
	},
	setNumCell: {
		width: 36,
		alignItems: "center",
	},
	setNum: {
		fontSize: 14,
		fontWeight: "600",
	},
	prevCell: {
		flex: 1.2,
		alignItems: "center",
	},
	prevText: {
		fontSize: 12,
	},
	inputCell: {
		flex: 1,
		paddingHorizontal: 4,
	},
	input: {
		textAlign: "center",
		fontSize: 15,
		fontWeight: "500",
		paddingVertical: 6,
		borderRadius: 8,
		fontVariant: ["tabular-nums"],
	},
	checkCell: {
		width: 44,
		alignItems: "center",
	},
	checkBox: {
		width: 24,
		height: 24,
		borderRadius: 6,
		borderWidth: 2,
		alignItems: "center",
		justifyContent: "center",
	},
});
