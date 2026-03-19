import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityHeatmap } from "@/components/profile/ActivityHeatmap";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SignOutButton } from "@/components/profile/SignOutButton";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppContext } from "@/src/context/AppContext";
import { getUserProfile } from "@/src/lib/userService";

export default function ProfileScreen() {
	const router = useRouter();
	const { userId, userProfile, isLoaded, setAccount } = useAppContext();
	const isLoggedIn = !!userId && !!userProfile;

	// Refresh profile from Firestore when logged in.
	useEffect(() => {
		if (!userId) return;
		(async () => {
			const fresh = await getUserProfile(userId);
			if (fresh) {
				await setAccount(userId, fresh);
			}
		})();
	}, [userId, setAccount]);

	if (!isLoaded) {
		return (
			<ThemedView style={{ flex: 1 }}>
				<SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<ActivityIndicator size="large" />
				</SafeAreaView>
			</ThemedView>
		);
	}

	if (!isLoggedIn) {
		return <Redirect href="/login" />;
	}

	return (
		<ThemedView style={{ flex: 1 }}>
			<SafeAreaView style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={styles.scrollContent}>
					{/* Top Action Bar */}
					<View style={styles.topActions}>
						<TouchableOpacity onPress={() => router.push("/settings")}>
							<Ionicons name="settings-outline" size={28} color="gray" />
						</TouchableOpacity>
					</View>

					{/* Profile Title */}
					<View style={styles.titleContainer}>
						<ThemedText type="title" style={{ fontSize: 36 }}>
							Profile
						</ThemedText>
					</View>

					<ProfileHeader profile={userProfile} />

					<View style={styles.separator} />

					<ActivityHeatmap />

					<View style={styles.separator} />

					<SignOutButton />
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
	separator: {
		height: 1.5,
		backgroundColor: "#e1e1e1",
		marginVertical: 32,
		marginHorizontal: 24,
	},
});
