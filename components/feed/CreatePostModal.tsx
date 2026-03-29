import { useState } from "react";
import {
	ActivityIndicator,
	Modal,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface Props {
	visible: boolean;
	onClose: () => void;
	onSubmit: (content: string) => Promise<void>;
}

/**
 * Modal for creating a new text post. Calls onSubmit with the text content,
 * then clears and closes itself.
 */
export function CreatePostModal({ visible, onClose, onSubmit }: Props) {
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(false);

	const cardBg = useThemeColor({}, "card");
	const cardBorder = useThemeColor({}, "cardBorder");
	const secondaryText = useThemeColor({}, "secondaryText");
	const accentColor = useThemeColor({}, "accent");
	const inputBg = useThemeColor({}, "inputBg");
	const textColor = useThemeColor({}, "text");

	async function handleSubmit() {
		const trimmed = content.trim();
		if (!trimmed) return;
		setLoading(true);
		await onSubmit(trimmed);
		setLoading(false);
		setContent("");
		onClose();
	}

	function handleClose() {
		setContent("");
		onClose();
	}

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

					<TouchableOpacity
						style={[
							styles.submitBtn,
							{ backgroundColor: accentColor, opacity: content.trim() ? 1 : 0.5 },
						]}
						onPress={handleSubmit}
						disabled={!content.trim() || loading}
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
