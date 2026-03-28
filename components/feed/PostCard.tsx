import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Post } from "@/src/types/workout";

const DEFAULT_AVATAR = require("@/assets/images/deermic.webp");

interface Props {
	post: Post;
	username: string;
}

/**
 * Renders a single feed post with avatar, username, timestamp, and content.
 */
export function PostCard({ post, username }: Props) {
	const cardBg = useThemeColor({ light: "#f5f5f5", dark: "#1c1c1e" }, "card");
	const cardBorder = useThemeColor({ light: "#e0e0e0", dark: "#2c2c2e" }, "cardBorder");
	const secondaryText = useThemeColor({ light: "#666666", dark: "#8e8e93" }, "secondaryText");

	const timestamp = new Date(post.createdAt).toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});

	return (
		<View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
			<View style={styles.header}>
				<Image source={DEFAULT_AVATAR} style={styles.avatar} contentFit="cover" />
				<View style={styles.meta}>
					<ThemedText type="defaultSemiBold">{username}</ThemedText>
					<ThemedText style={[styles.timestamp, { color: secondaryText }]}>
						{timestamp}
					</ThemedText>
				</View>
			</View>
			<ThemedText style={styles.content}>{post.content}</ThemedText>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 10,
	},
	meta: {
		flex: 1,
	},
	timestamp: {
		fontSize: 12,
		marginTop: 2,
	},
	content: {
		fontSize: 15,
		lineHeight: 22,
	},
});
