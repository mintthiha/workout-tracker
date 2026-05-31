import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { AppModal } from "@/components/ui/AppModal";
import { useThemeColor } from "@/hooks/use-theme-color";

interface Props {
	visible: boolean;
	onDismiss: () => void;
	icon: string;
	iconColor: string;
	iconBg: string;
	title: string;
	body: string;
	primaryLabel: string;
	primaryColor: string;
	secondaryLabel: string;
	onPrimary: () => void;
	onSecondary: () => void;
}

export function ConfirmModal({
	visible,
	onDismiss,
	icon,
	iconColor,
	iconBg,
	title,
	body,
	primaryLabel,
	primaryColor,
	secondaryLabel,
	onPrimary,
	onSecondary,
}: Props) {
	const glassBorder = useThemeColor({}, "glassBorder");
	const secondaryText = useThemeColor({}, "secondaryText");

	return (
		<AppModal visible={visible} onDismiss={onDismiss}>
			<View style={styles.content}>
				<View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
					<Ionicons name={icon as any} size={30} color={iconColor} />
				</View>
				<ThemedText style={styles.title}>{title}</ThemedText>
				<ThemedText style={[styles.body, { color: secondaryText }]}>{body}</ThemedText>
				<TouchableOpacity
					style={[styles.primaryBtn, { backgroundColor: primaryColor }]}
					onPress={onPrimary}
				>
					<ThemedText style={styles.primaryBtnText}>{primaryLabel}</ThemedText>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.secondaryBtn, { borderColor: glassBorder }]}
					onPress={onSecondary}
				>
					<ThemedText style={[styles.secondaryBtnText, { color: primaryColor }]}>
						{secondaryLabel}
					</ThemedText>
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
	secondaryBtn: {
		width: "100%",
		paddingVertical: 15,
		borderRadius: 14,
		alignItems: "center",
		borderWidth: 1,
	},
	secondaryBtnText: {
		fontSize: 16,
		fontWeight: "600",
	},
});
