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
	const textColor = useThemeColor({}, "text");
	const secondaryText = useThemeColor({}, "secondaryText");
	const glassDivider = useThemeColor({}, "glassDivider");
	const inputBg = useThemeColor({}, "inputBg");
	const completedRowBg = useThemeColor({}, "completedRowBg");
	const completedInputBg = useThemeColor({}, "completedInputBg");
	const completedBorder = useThemeColor({}, "completedBorder");
	const success = useThemeColor({}, "success");

	const rowBg = set.completed ? completedRowBg : "transparent";
	const currentInputBg = set.completed ? completedInputBg : inputBg;
	const currentInputBorder = set.completed ? completedBorder : "transparent";

	return (
		<View
			style={[
				styles.row,
				{ backgroundColor: rowBg, borderTopColor: glassDivider },
			]}
		>
			{/* Set number — long press to remove */}
			<TouchableOpacity onLongPress={onRemove} style={styles.setNumCell}>
				<ThemedText style={[styles.setNum, { color: secondaryText }]}>{setNumber}</ThemedText>
			</TouchableOpacity>

			{/* Previous target */}
			<View style={styles.prevCell}>
				<ThemedText style={[styles.prevText, { color: secondaryText }]}>
					{set.targetWeight > 0 ? `${set.targetWeight}×${set.targetReps}` : "—"}
				</ThemedText>
			</View>

			{/* Weight input */}
			<View style={styles.inputCell}>
				<TextInput
					style={[
						styles.input,
						{
							backgroundColor: currentInputBg,
							color: textColor,
							borderColor: currentInputBorder,
						},
					]}
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
					style={[
						styles.input,
						{
							backgroundColor: currentInputBg,
							color: textColor,
							borderColor: currentInputBorder,
						},
					]}
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
						set.completed
							? { backgroundColor: success, borderColor: success }
							: { borderColor: secondaryText },
					]}
				>
					{set.completed && <Ionicons name="checkmark" size={13} color="#fff" />}
				</View>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 7,
		borderTopWidth: 1,
		borderRadius: 8,
		marginHorizontal: -2,
		paddingHorizontal: 2,
	},
	setNumCell: {
		width: 36,
		alignItems: "center",
	},
	setNum: {
		fontSize: 14,
		fontWeight: "600",
		fontVariant: ["tabular-nums"],
	},
	prevCell: {
		flex: 1.2,
		alignItems: "center",
	},
	prevText: {
		fontSize: 12,
		fontVariant: ["tabular-nums"],
	},
	inputCell: {
		flex: 1,
		paddingHorizontal: 3,
	},
	input: {
		textAlign: "center",
		fontSize: 15,
		fontWeight: "600",
		paddingVertical: 7,
		borderRadius: 10,
		borderWidth: 1,
		fontVariant: ["tabular-nums"],
	},
	checkCell: {
		width: 44,
		alignItems: "center",
	},
	checkBox: {
		width: 26,
		height: 26,
		borderRadius: 8,
		borderWidth: 2,
		alignItems: "center",
		justifyContent: "center",
	},
});
