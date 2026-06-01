import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { AppModal } from "@/components/ui/AppModal";
import { useThemeColor } from "@/hooks/use-theme-color";

interface Props {
	visible: boolean;
	onDismiss: () => void;
	title: string;
	body: string;
	icon?: string;
	iconColor?: string;
	iconBg?: string;
	primaryLabel?: string;
	primaryColor?: string;
	onPrimary?: () => void;
}

export function AlertModal({
	visible,
	onDismiss,
	title,
	body,
	icon = "information-circle-outline",
	iconColor,
	iconBg,
	primaryLabel = "OK",
	primaryColor,
	onPrimary,
}: Props) {
	const secondaryText = useThemeColor({}, "secondaryText");
	const primary = useThemeColor({}, "primary");
	const accentTint = useThemeColor({}, "accentTint");
	
	const resolvedIconColor = iconColor || primary;
	const resolvedIconBg = iconBg || accentTint;
	const resolvedPrimaryColor = primaryColor || primary;

	return (
		<AppModal visible={visible} onDismiss={onDismiss}>
			<View style={styles.content}>
				<View style={[styles.iconWrap, { backgroundColor: resolvedIconBg }]}>
					<Ionicons name={icon as any} size={30} color={resolvedIconColor} />
				</View>
				<ThemedText style={styles.title}>{title}</ThemedText>
				<ThemedText style={[styles.body, { color: secondaryText }]}>{body}</ThemedText>
				<TouchableOpacity
					style={[styles.primaryBtn, { backgroundColor: resolvedPrimaryColor }]}
					onPress={() => {
						if (onPrimary) onPrimary();
						onDismiss();
					}}
				>
					<ThemedText style={styles.primaryBtnText}>{primaryLabel}</ThemedText>
				</TouchableOpacity>
			</View>
		</AppModal>
	);
}

const styles = StyleSheet.create({
	content: {
		alignItems: "center",
		padding: 28,
		gap: 10,
	},
	iconWrap: {
		width: 60,
		height: 60,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 4,
	},
	title: {
		fontSize: 19,
		fontWeight: "700",
		textAlign: "center",
		letterSpacing: -0.3,
	},
	body: {
		fontSize: 14,
		textAlign: "center",
		lineHeight: 20,
		marginBottom: 6,
	},
	primaryBtn: {
		width: "100%",
		paddingVertical: 15,
		borderRadius: 14,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
	},
	primaryBtnText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
	},
});
