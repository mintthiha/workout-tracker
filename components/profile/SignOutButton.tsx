import { ThemedText } from "@/components/themed-text";
import { useAppContext } from "@/src/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from "react-native";

export function SignOutButton() {
	const { signOut } = useAppContext();

	async function handleSignOut() {
		if (Platform.OS === "web") {
			if (!window.confirm("Are you sure you want to sign out?")) return;
			try {
				await signOut();
			} catch {
				window.alert("Failed to sign out. Please try again.");
			}
			return;
		}

		Alert.alert("Sign Out", "Are you sure you want to sign out?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Sign Out",
				style: "destructive",
				onPress: async () => {
					try {
						await signOut();
					} catch {
						Alert.alert("Error", "Failed to sign out. Please try again.");
					}
				},
			},
		]);
	}

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.button} onPress={handleSignOut} activeOpacity={0.7}>
				<Ionicons name="log-out-outline" size={22} color="#d32f2f" />
				<ThemedText style={styles.text}>Sign Out</ThemedText>
			</TouchableOpacity>
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
