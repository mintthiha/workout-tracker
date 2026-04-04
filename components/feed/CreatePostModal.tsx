import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Modal,
	Platform,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import { FeedMedia } from "@/components/feed/FeedMedia";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { uploadToCloudinary } from "@/src/lib/cloudinary";
import { PostMedia, PostMediaType } from "@/src/types/workout";

interface DraftMedia {
	type: PostMediaType;
	uri: string;
	width?: number;
	height?: number;
}

interface Props {
	visible: boolean;
	onClose: () => void;
	onSubmit: (input: { content: string; media?: PostMedia }) => Promise<void>;
}

/**
 * Modal for creating a text, image, video, or mixed post.
 */
export function CreatePostModal({ visible, onClose, onSubmit }: Props) {
	const [content, setContent] = useState("");
	const [selectedMedia, setSelectedMedia] = useState<DraftMedia | null>(null);
	const [loading, setLoading] = useState(false);

	const cardBg = useThemeColor({}, "card");
	const cardBorder = useThemeColor({}, "cardBorder");
	const secondaryText = useThemeColor({}, "secondaryText");
	const accentColor = useThemeColor({}, "accent");
	const inputBg = useThemeColor({}, "inputBg");
	const textColor = useThemeColor({}, "text");

	function resetState() {
		setContent("");
		setSelectedMedia(null);
	}

	async function handlePickMedia() {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			if (Platform.OS === "web") {
				window.alert("Permission to access media library is required.");
			} else {
				Alert.alert("Permission required", "Allow access to your library to attach media.");
			}
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [4, 5],
			quality: 0.8,
			videoMaxDuration: 60,
		});

		if (result.canceled) return;

		const asset = result.assets[0];
		setSelectedMedia({
			type: asset.type === "video" ? "video" : "image",
			uri: asset.uri,
			width: asset.width,
			height: asset.height,
		});
	}

	async function handleSubmit() {
		setLoading(true);
		try {
			let media: PostMedia | undefined;

			if (selectedMedia) {
				const upload = await uploadToCloudinary(selectedMedia.uri, selectedMedia.type);
				media = {
					type: selectedMedia.type,
					url: upload.url,
					publicId: upload.publicId,
					width: selectedMedia.width,
					height: selectedMedia.height,
				};
			}

			await onSubmit({ content, media });
			resetState();
			onClose();
		} catch {
			if (Platform.OS === "web") {
				window.alert("Failed to create post. Please try again.");
			} else {
				Alert.alert("Post failed", "Failed to create post. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	}

	function handleClose() {
		resetState();
		onClose();
	}

	const canSubmit = !!content.trim() || !!selectedMedia;

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
			<View style={styles.overlay}>
				<View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
					<View style={styles.header}>
						<ThemedText type="defaultSemiBold" style={styles.title}>
							New Post
						</ThemedText>
						<TouchableOpacity onPress={handleClose}>
							<ThemedText style={{ color: secondaryText }}>Cancel</ThemedText>
						</TouchableOpacity>
					</View>

					<TextInput
						style={[
							styles.input,
							{ backgroundColor: inputBg, color: textColor },
						]}
						placeholder="What's on your mind?"
						placeholderTextColor={secondaryText}
						value={content}
						onChangeText={setContent}
						multiline
						maxLength={500}
						autoFocus
					/>

					{selectedMedia ? (
						<View style={styles.mediaPreview}>
							<FeedMedia
								media={{
									type: selectedMedia.type,
									url: selectedMedia.uri,
									publicId: "draft",
									width: selectedMedia.width,
									height: selectedMedia.height,
								}}
							/>
							<TouchableOpacity
								style={[styles.mediaAction, { borderColor: cardBorder }]}
								onPress={() => setSelectedMedia(null)}
								disabled={loading}
							>
								<Ionicons name="close-circle-outline" size={16} color={secondaryText} />
								<ThemedText style={{ color: secondaryText }}>Remove attachment</ThemedText>
							</TouchableOpacity>
						</View>
					) : null}

					<TouchableOpacity
						style={[styles.mediaAction, { borderColor: cardBorder }]}
						onPress={handlePickMedia}
						disabled={loading}
					>
						<Ionicons name="images-outline" size={18} color={secondaryText} />
						<ThemedText style={{ color: secondaryText }}>Add image or video</ThemedText>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.submitBtn,
							{ backgroundColor: accentColor, opacity: canSubmit ? 1 : 0.5 },
						]}
						onPress={handleSubmit}
						disabled={!canSubmit || loading}
					>
						{loading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<ThemedText style={styles.submitBtnText}>Post</ThemedText>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: "rgba(0,0,0,0.4)",
	},
	card: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		borderWidth: 1,
		padding: 20,
		gap: 16,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	title: {
		fontSize: 18,
	},
	input: {
		borderRadius: 10,
		padding: 12,
		fontSize: 15,
		minHeight: 100,
		textAlignVertical: "top",
	},
	mediaPreview: {
		gap: 10,
	},
	mediaAction: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		borderWidth: 1,
		borderRadius: 10,
		paddingVertical: 12,
		paddingHorizontal: 14,
	},
	submitBtn: {
		borderRadius: 10,
		paddingVertical: 14,
		alignItems: "center",
	},
	submitBtnText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
});
