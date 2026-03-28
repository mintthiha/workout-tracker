import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Alert, Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { CachedProfile } from "@/src/lib/appStorage";
import { uploadToCloudinary } from "@/src/lib/cloudinary";
import { updateUserProfile } from "@/src/lib/userService";
import { useAppContext } from "@/src/context/AppContext";

const DEFAULT_AVATAR = require("../../assets/images/deermic.webp");

interface ProfileHeaderProps {
	profile: CachedProfile;
}

/**
 * Displays user avatar, name, username, and email.
 * Tapping the avatar opens the image picker to upload a new profile picture.
 */
export function ProfileHeader({ profile }: ProfileHeaderProps) {
	const { userId, setAccount } = useAppContext();
	const [uploading, setUploading] = useState(false);

	async function handleAvatarPress() {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			if (Platform.OS === "web") {
				window.alert("Permission to access media library is required.");
			} else {
				Alert.alert("Permission required", "Allow access to your photo library to change your profile picture.");
			}
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (result.canceled) return;

		const uri = result.assets[0].uri;
		setUploading(true);
		try {
			const { url, publicId } = await uploadToCloudinary(uri, "image");
			await updateUserProfile(userId!, { avatarUrl: url, avatarPublicId: publicId });
			await setAccount(userId!, { ...profile, avatarUrl: url, avatarPublicId: publicId });
		} catch {
			if (Platform.OS === "web") {
				window.alert("Failed to upload profile picture. Please try again.");
			} else {
				Alert.alert("Upload failed", "Failed to upload profile picture. Please try again.");
			}
		} finally {
			setUploading(false);
		}
	}

	return (
		<View style={styles.container}>
			<TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
				<Image
					source={profile.avatarUrl ?? DEFAULT_AVATAR}
					style={styles.image}
					contentFit="cover"
				/>
				<View style={styles.editBadge}>
					{uploading ? (
						<ActivityIndicator size="small" color="#fff" />
					) : (
						<Ionicons name="camera" size={14} color="#fff" />
					)}
				</View>
			</TouchableOpacity>

			<View style={styles.info}>
				<ThemedText type="defaultSemiBold" style={styles.name}>
					{profile.firstName} {profile.lastName}
				</ThemedText>
				<ThemedText style={styles.username}>@{profile.username}</ThemedText>
				<ThemedText style={styles.email}>{profile.email}</ThemedText>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 24,
		gap: 20,
	},
	image: {
		height: 110,
		width: 110,
		borderRadius: 55,
		backgroundColor: "#eee",
	},
	editBadge: {
		position: "absolute",
		bottom: 4,
		right: 4,
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: "#3498db",
		justifyContent: "center",
		alignItems: "center",
	},
	info: {
		flex: 1,
	},
	name: {
		fontSize: 28,
		fontWeight: "700",
	},
	username: {
		fontSize: 18,
		color: "gray",
		marginTop: 2,
	},
	email: {
		fontSize: 14,
		color: "gray",
		marginTop: 2,
	},
});
