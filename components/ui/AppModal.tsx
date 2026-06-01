import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

interface Props {
	visible: boolean;
	onDismiss: () => void;
	children: React.ReactNode;
}

export function AppModal({ visible, onDismiss, children }: Props) {
	const glassCard = useThemeColor({}, "glassCard");
	const glassBorder = useThemeColor({}, "glassBorder");

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
			<View style={styles.backdrop}>
				<TouchableOpacity
					style={StyleSheet.absoluteFillObject}
					activeOpacity={1}
					onPress={onDismiss}
				/>
				<View
					style={[
						styles.card,
						{ backgroundColor: glassCard, borderColor: glassBorder, borderWidth: 1 },
					]}
				>
					{children}
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.55)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
	},
	card: {
		width: "100%",
		borderRadius: 24,
		overflow: "hidden",
	},
});
