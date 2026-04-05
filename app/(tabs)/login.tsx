import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoginForm } from "@/components/login/LoginForm";
import { RegisterForm } from "@/components/login/RegisterForm";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppContext } from "@/src/context/AppContext";

export default function LoginScreen() {
	const router = useRouter();
	const { userId, userProfile, isLoaded } = useAppContext();
	const isLoggedIn = !!userId && !!userProfile;
	const [mode, setMode] = useState<"login" | "register">("login");

	if (!isLoaded) {
		return (
			<ThemedView style={{ flex: 1 }}>
				<SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<ActivityIndicator size="large" />
				</SafeAreaView>
			</ThemedView>
		);
	}

	if (isLoggedIn) {
		return <Redirect href="/profile" />;
	}

	return (
		<ThemedView style={{ flex: 1 }}>
			<SafeAreaView style={{ flex: 1 }}>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.topActions}>
						<View />
						<TouchableOpacity onPress={() => router.push("/settings")}>
							<Ionicons name="settings-outline" size={28} color="gray" />
						</TouchableOpacity>
					</View>

					<View style={styles.titleContainer}>
						<ThemedText type="title" style={{ fontSize: 36 }}>
							{mode === "login" ? "Login" : "Create Account"}
						</ThemedText>
					</View>

					{mode === "login" ? (
						<LoginForm onSwitchToRegister={() => setMode("register")} />
					) : (
						<RegisterForm onSwitchToLogin={() => setMode("login")} />
					)}
				</ScrollView>
			</SafeAreaView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	scrollContent: {
		paddingBottom: 60,
	},
	topActions: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingTop: 20,
		marginBottom: 15,
	},
	titleContainer: {
		paddingHorizontal: 24,
		marginBottom: 30,
	},
});
