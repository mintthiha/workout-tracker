import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Switch, TouchableOpacity, View } from "react-native";

interface SettingToggleProps {
	type: "toggle";
	label: string;
	description?: string;
	value: boolean;
	onValueChange: (value: boolean) => void;
}

interface SettingSelectProps<T extends string | number> {
	type: "select";
	label: string;
	description?: string;
	value: T;
	options: { label: string; value: T }[];
	onValueChange: (value: T) => void;
}

export type SettingRowProps<T extends string | number = string> =
	| SettingToggleProps
	| SettingSelectProps<T>;

export function SettingRow<T extends string | number>(props: SettingRowProps<T>) {
	const cardBg = useThemeColor({}, "card");
	const borderColor = useThemeColor({}, "cardBorder");
	const accent = useThemeColor({}, "accent");

	if (props.type === "toggle") {
		return (
			<View style={[styles.row, { backgroundColor: cardBg, borderColor }]}>
				<View style={styles.labelSection}>
					<ThemedText style={styles.label}>{props.label}</ThemedText>
					{props.description && (
						<ThemedText style={styles.description}>{props.description}</ThemedText>
					)}
				</View>
				<Switch
					value={props.value}
					onValueChange={props.onValueChange}
					trackColor={{ false: "#767577", true: accent }}
					thumbColor="#fff"
				/>
			</View>
		);
	}

	return <SelectSetting {...props} />;
}

function SelectSetting<T extends string | number>({
	label,
	description,
	value,
	options,
	onValueChange,
}: SettingSelectProps<T>) {
	const cardBg = useThemeColor({}, "card");
	const borderColor = useThemeColor({}, "cardBorder");
	const accent = useThemeColor({}, "accent");
	const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

	return (
		<View style={[styles.selectContainer, { backgroundColor: cardBg, borderColor }]}>
			<View style={styles.selectHeader}>
				<View style={styles.labelSection}>
					<ThemedText style={styles.label}>{label}</ThemedText>
					{description && (
						<ThemedText style={styles.description}>{description}</ThemedText>
					)}
				</View>
				<ThemedText style={[styles.selectedValue, { color: accent }]}>
					{selectedLabel}
				</ThemedText>
			</View>
			<View style={styles.optionsContainer}>
				{options.map((option) => {
					const isSelected = option.value === value;
					return (
						<TouchableOpacity
							key={String(option.value)}
							style={[
								styles.optionPill,
								{
									backgroundColor: isSelected ? accent : "transparent",
									borderColor: isSelected ? accent : borderColor,
								},
							]}
							onPress={() => onValueChange(option.value)}
							activeOpacity={0.7}
						>
							<ThemedText
								style={[
									styles.optionText,
									{ color: isSelected ? "#fff" : undefined },
								]}
							>
								{option.label}
							</ThemedText>
							{isSelected && (
								<Ionicons
									name="checkmark"
									size={16}
									color="#fff"
									style={{ marginLeft: 4 }}
								/>
							)}
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 10,
	},
	labelSection: {
		flex: 1,
		marginRight: 12,
	},
	label: {
		fontSize: 16,
		fontWeight: "500",
	},
	description: {
		fontSize: 13,
		marginTop: 2,
		opacity: 0.6,
	},
	selectedValue: {
		fontSize: 14,
		fontWeight: "600",
	},
	selectContainer: {
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 10,
		overflow: "hidden",
	},
	selectHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingTop: 14,
		paddingBottom: 10,
	},
	optionsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		paddingHorizontal: 12,
		paddingBottom: 12,
		gap: 8,
	},
	optionPill: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
	},
	optionText: {
		fontSize: 14,
		fontWeight: "500",
	},
});
