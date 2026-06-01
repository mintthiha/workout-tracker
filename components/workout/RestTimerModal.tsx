import { useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";

interface Props {
	visible: boolean;
	seconds: number;
	onDismiss: () => void;
}

function formatCountdown(s: number): string {
	const m = Math.floor(s / 60);
	const sec = s % 60;
	return `${m}:${String(sec).padStart(2, "0")}`;
}

export function RestTimerModal({ visible, seconds, onDismiss }: Props) {
	const [remaining, setRemaining] = useState(seconds);
	const scheme = useColorScheme();

	const glassCard = useThemeColor({}, "glassCard");
	const glassBorder = useThemeColor({}, "glassBorder");
	const primary = useThemeColor({}, "primary");
	const success = useThemeColor({}, "success");
	const successTint = useThemeColor({}, "successTint");
	const accentTint = useThemeColor({}, "accentTint");
	const secondaryText = useThemeColor({}, "secondaryText");

	useEffect(() => {
		if (!visible) return;
		setRemaining(seconds);

		const id = setInterval(() => {
			setRemaining((prev) => {
				if (prev <= 1) {
					clearInterval(id);
					onDismiss();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(id);
	}, [visible, seconds, onDismiss]);

	const isAlmostDone = remaining <= 5;
	const timerColor = isAlmostDone ? success : primary;
	const timerTint = isAlmostDone ? successTint : accentTint;

	const cardContent = (
		<>
			<View style={styles.ringContainer}>
				<View style={[styles.ringBg, { borderColor: timerColor + "22" }]} />
				<View
					style={[
						styles.ringFg,
						{ borderColor: timerColor, opacity: 0.35 + 0.65 * (remaining / Math.max(seconds, 1)) },
					]}
				/>
				<View style={styles.ringCenter}>
					<ThemedText style={[styles.label, { color: secondaryText }]}>REST</ThemedText>
					<ThemedText style={[styles.countdown, { color: timerColor }]}>
						{formatCountdown(remaining)}
					</ThemedText>
				</View>
			</View>

			<View style={styles.actionRow}>
				<TouchableOpacity
					style={[styles.timeBtn, { backgroundColor: timerTint }]}
					onPress={() => setRemaining((prev) => Math.max(0, prev - 10))}
				>
					<ThemedText style={[styles.timeBtnText, { color: timerColor }]}>-10s</ThemedText>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.skipBtn, { backgroundColor: timerTint, borderColor: timerColor + "50" }]}
					onPress={onDismiss}
				>
					<ThemedText style={[styles.skipBtnText, { color: timerColor }]}>Skip</ThemedText>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.timeBtn, { backgroundColor: timerTint }]}
					onPress={() => setRemaining((prev) => prev + 10)}
				>
					<ThemedText style={[styles.timeBtnText, { color: timerColor }]}>+10s</ThemedText>
				</TouchableOpacity>
			</View>
		</>
	);

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
			<View style={styles.overlay}>
				<View style={[styles.card, { backgroundColor: glassCard, borderColor: glassBorder }]}>
					{cardContent}
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.6)",
	},
	card: {
		width: 300,
		borderRadius: 28,
		alignItems: "center",
		paddingVertical: 36,
		paddingHorizontal: 20,
		gap: 24,
		borderWidth: 1,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 12 },
		shadowOpacity: 0.4,
		shadowRadius: 24,
		elevation: 12,
	},
	ringContainer: {
		width: 180,
		height: 180,
		alignItems: "center",
		justifyContent: "center",
	},
	ringBg: {
		position: "absolute",
		width: 180,
		height: 180,
		borderRadius: 90,
		borderWidth: 5,
	},
	ringFg: {
		position: "absolute",
		width: 180,
		height: 180,
		borderRadius: 90,
		borderWidth: 5,
	},
	ringCenter: {
		alignItems: "center",
		gap: 4,
	},
	label: {
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 2,
	},
	countdown: {
		fontSize: 44,
		fontWeight: "700",
		fontVariant: ["tabular-nums"],
		letterSpacing: -1,
		lineHeight: 56,
		includeFontPadding: false,
	},
	actionRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
		gap: 8,
	},
	timeBtn: {
		width: 56,
		height: 44,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
	},
	timeBtnText: {
		fontSize: 14,
		fontWeight: "700",
	},
	skipBtn: {
		flex: 1,
		height: 44,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 14,
		borderWidth: 1,
	},
	skipBtnText: {
		fontSize: 15,
		fontWeight: "700",
	},
});
