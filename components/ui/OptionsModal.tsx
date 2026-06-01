import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { AppModal } from "@/components/ui/AppModal";
import { useThemeColor } from "@/hooks/use-theme-color";

export interface OptionItem {
	id: string;
	label: string;
	description?: string;
	icon: string;
	color: string;
	onPress: () => void;
}

interface Props {
	visible: boolean;
	title: string;
	subtitle?: string;
	options: OptionItem[];
	onDismiss: () => void;
}

export function OptionsModal({
	visible,
	title,
	subtitle,
	options,
	onDismiss,
}: Props) {
	const glassDivider = useThemeColor({}, "glassDivider");
	const secondaryText = useThemeColor({}, "secondaryText");

	return (
		<AppModal visible={visible} onDismiss={onDismiss}>
			<View style={styles.header}>
				<ThemedText style={styles.title} numberOfLines={1}>{title}</ThemedText>
				{subtitle && (
					<ThemedText style={[styles.subtitle, { color: secondaryText }]}>
						{subtitle}
					</ThemedText>
				)}
			</View>
			<View style={[styles.separator, { backgroundColor: glassDivider }]} />
			{options.map((item, i) => {
				const isLast = i === options.length - 1;
				return (
					<TouchableOpacity
						key={item.id}
						style={[
							styles.option,
							!isLast && {
								borderBottomWidth: StyleSheet.hairlineWidth,
								borderBottomColor: glassDivider,
							},
						]}
						onPress={() => {
							item.onPress();
							onDismiss();
						}}
						activeOpacity={0.7}
					>
						<View style={[styles.iconWrap, { backgroundColor: item.color + "22" }]}>
							<Ionicons name={item.icon as any} size={20} color={item.color} />
						</View>
						<View style={styles.textGroup}>
							<ThemedText style={[styles.optionLabel, { color: item.color }]}>
								{item.label}
							</ThemedText>
							<ThemedText style={[styles.optionDesc, { color: secondaryText }]}>
								{item.description}
							</ThemedText>
						</View>
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
