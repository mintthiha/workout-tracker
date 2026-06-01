import { useState } from "react";
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { AlertModal } from "@/components/ui/AlertModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAppContext } from "@/src/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

export function SignOutButton() {
	const { signOut } = useAppContext();
	const [showConfirm, setShowConfirm] = useState(false);
	const [showError, setShowError] = useState(false);
	const danger = useThemeColor({}, "danger");
	const dangerTint = useThemeColor({}, "dangerTint");

	async function doSignOut() {
		try {
			await signOut();
		} catch {
			setShowError(true);
		}
	}

	async function handleSignOut() {
		if (Platform.OS === "web") {
			if (!window.confirm("Are you sure you want to sign out?")) return;
			await doSignOut();
			return;
		}

		setShowConfirm(true);
	}

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.button} onPress={handleSignOut} activeOpacity={0.7}>
				<Ionicons name="log-out-outline" size={22} color="#d32f2f" />
				<ThemedText style={styles.text}>Sign Out</ThemedText>
			</TouchableOpacity>

			<ConfirmModal
				visible={showConfirm}
				onDismiss={() => setShowConfirm(false)}
				icon="log-out-outline"
				iconColor={danger}
				iconBg={dangerTint}
				title="Sign Out"
				body="Are you sure you want to sign out?"
				primaryLabel="Sign Out"
				primaryColor={danger}
				secondaryLabel="Cancel"
				onPrimary={() => {
					setShowConfirm(false);
					doSignOut();
				}}
				onSecondary={() => setShowConfirm(false)}
			/>

			<AlertModal
				visible={showError}
				onDismiss={() => setShowError(false)}
				title="Error"
				body="Failed to sign out. Please try again."
				icon="alert-circle-outline"
				iconColor={danger}
				iconBg={dangerTint}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 24,
	},
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 14,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#d32f2f",
	},
	text: {
		color: "#d32f2f",
		fontSize: 16,
		fontWeight: "600",
	},
});
