import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Animated, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";

import { ThemedText } from "@/components/themed-text";
import { SetTypePickerModal } from "@/components/workout/SetTypePickerModal";
import { useThemeColor } from "@/hooks/use-theme-color";
import { OneRepMaxFormula, WeightUnit } from "@/src/lib/appStorage";
import { calculateOneRepMax } from "@/src/lib/oneRepMax";
import { ActiveSet, SetType } from "@/src/types/workout";

interface Props {
	set: ActiveSet;
	setNumber: number;
	onWeightChange: (value: number) => void;
	onRepsChange: (value: number) => void;
	onToggleComplete: () => void;
	onRemove: () => void;
	onChangeType?: (type: SetType) => void;
	oneRepMaxFormula?: OneRepMaxFormula;
	weightUnit?: WeightUnit;
}

const SET_TYPE_STYLES: Record<
	string,
	{ icon: string; color: string }
> = {
	warmup:  { icon: "flame",             color: "#3b82f6" },
	failure: { icon: "flash",             color: "#ef4444" },
	drop:    { icon: "arrow-down-circle", color: "#f97316" },
};

/** Renders a single set row with inputs, completion toggle, and an e1RM badge when completed. */
export function SetRow({
	set,
	setNumber,
	onWeightChange,
	onRepsChange,
	onToggleComplete,
	onRemove,
	onChangeType,
	oneRepMaxFormula,
	weightUnit = "lbs",
}: Props) {
	const [showTypePicker, setShowTypePicker] = useState(false);

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

	const scaleAnim = useRef(new Animated.Value(1)).current;

	const handlePressIn = () => {
		Animated.spring(scaleAnim, { toValue: 0.85, useNativeDriver: true }).start();
	};

	const handlePressOut = () => {
		Animated.spring(scaleAnim, {
			toValue: 1,
			friction: 3,
			tension: 40,
			useNativeDriver: true,
		}).start();
	};

	const typeStyle = set.type ? SET_TYPE_STYLES[set.type] : null;

	const e1rm =
		set.completed && set.actualWeight > 0 && set.actualReps > 0 && oneRepMaxFormula
			? calculateOneRepMax(set.actualWeight, set.actualReps, oneRepMaxFormula)
			: 0;

	const renderRightActions = () => {
		return (
			<TouchableOpacity
				style={styles.deleteAction}
				onPress={onRemove}
			>
				<Ionicons name="trash-outline" size={20} color="#fff" />
			</TouchableOpacity>
		);
	};

	return (
		<>
			<Swipeable renderRightActions={renderRightActions} overshootRight={false}>
				<View style={[styles.row, { backgroundColor: rowBg, borderTopColor: glassDivider }]}>
				{/* Set type badge — tap to change, long press to remove */}
				<TouchableOpacity
					onPress={() => onChangeType && setShowTypePicker(true)}
					onLongPress={onRemove}
					style={styles.setNumCell}
				>
					<View
						style={[
							styles.badge,
							{ backgroundColor: typeStyle ? typeStyle.color + "20" : "transparent" },
						]}
					>
						{typeStyle ? (
							<Ionicons name={typeStyle.icon as any} size={16} color={typeStyle.color} />
						) : (
							<ThemedText style={[styles.setNum, { color: secondaryText }]}>
								{setNumber}
							</ThemedText>
						)}
					</View>
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
						onFocus={() => {
							if (set.actualWeight === 0 && set.targetWeight > 0) {
								onWeightChange(set.targetWeight);
							}
						}}
						keyboardType="numeric"
						returnKeyType="done"
						maxLength={6}
						placeholder={set.targetWeight > 0 ? String(set.targetWeight) : "0"}
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
						onFocus={() => {
							if (set.actualReps === 0 && set.targetReps > 0) {
								onRepsChange(set.targetReps);
							}
						}}
						keyboardType="numeric"
						returnKeyType="done"
						maxLength={3}
						placeholder={set.targetReps > 0 ? String(set.targetReps) : "0"}
						placeholderTextColor={secondaryText}
						selectTextOnFocus
					/>
				</View>

				{/* Checkmark */}
				<TouchableOpacity
					style={styles.checkCell}
					onPress={onToggleComplete}
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					activeOpacity={1}
				>
					<Animated.View
						style={[
							styles.checkBox,
							{ transform: [{ scale: scaleAnim }] },
							set.completed
								? { backgroundColor: success, borderColor: success }
								: { borderColor: secondaryText },
						]}
					>
						{set.completed && <Ionicons name="checkmark" size={13} color="#fff" />}
					</Animated.View>
				</TouchableOpacity>
			</View>
			</Swipeable>

			{e1rm > 0 && (
				<View style={[styles.e1rmRow, { borderTopColor: glassDivider }]}>
					<ThemedText style={[styles.e1rmText, { color: success }]}>
						Est. 1RM: {Math.round(e1rm)} {weightUnit}
					</ThemedText>
				</View>
			)}

			{onChangeType && (
				<SetTypePickerModal
					visible={showTypePicker}
					current={set.type ?? "normal"}
					onSelect={onChangeType}
					onDismiss={() => setShowTypePicker(false)}
				/>
			)}
		</>
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
		justifyContent: "center",
	},
	badge: {
		width: 28,
		height: 28,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	setNum: {
		fontSize: 13,
		fontWeight: "700",
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
	deleteAction: {
		backgroundColor: "#ef4444",
		justifyContent: "center",
		alignItems: "center",
		width: 70,
		borderTopWidth: 1,
		borderTopColor: "transparent",
		marginBottom: 0,
		marginVertical: 0,
	},
	e1rmRow: {
		alignItems: "center",
		paddingVertical: 4,
		borderTopWidth: 1,
		marginHorizontal: -2,
		paddingHorizontal: 2,
	},
	e1rmText: {
		fontSize: 11,
		fontWeight: "600",
		letterSpacing: 0.3,
	},
});
