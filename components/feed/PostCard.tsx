import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FeedMedia } from "@/components/feed/FeedMedia";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Post } from "@/src/types/workout";

const DEFAULT_AVATAR = require("@/assets/images/defaultPFP.jpg");

interface Props {
	post: Post;
	username: string;
	avatarUrl?: string;
	liked?: boolean;
	onToggleLike?: (post: Post) => void;
	onViewLikes?: (post: Post) => void;
}

/**
 * Renders a single feed post with avatar, username, timestamp, and content.
 */
export function PostCard({
	post,
	username,
	avatarUrl,
	liked = false,
	onToggleLike,
	onViewLikes,
}: Props) {
	const cardBg = useThemeColor({ light: "#f5f5f5", dark: "#1c1c1e" }, "card");
	const cardBorder = useThemeColor({ light: "#e0e0e0", dark: "#2c2c2e" }, "cardBorder");
	const primary = useThemeColor({}, "primary");
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
				<Image source={avatarUrl ?? DEFAULT_AVATAR} style={styles.avatar} contentFit="cover" />
				<View style={styles.meta}>
					<ThemedText type="defaultSemiBold">{username}</ThemedText>
					<ThemedText style={[styles.timestamp, { color: secondaryText }]}>
						{timestamp}
					</ThemedText>
				</View>
			</View>
			{post.content ? <ThemedText style={styles.content}>{post.content}</ThemedText> : null}
			{post.media ? <FeedMedia media={post.media} /> : null}
			<View style={styles.actions}>
				<TouchableOpacity
					style={styles.likeButton}
					onPress={() => onToggleLike?.(post)}
					disabled={!onToggleLike}
					accessibilityRole="button"
					accessibilityLabel={liked ? "Unlike post" : "Like post"}
				>
					<Ionicons
						name={liked ? "heart" : "heart-outline"}
						size={22}
						color={liked ? primary : secondaryText}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.likeCountButton}
					onPress={() => onViewLikes?.(post)}
					disabled={!onViewLikes}
					accessibilityRole="button"
					accessibilityLabel="View post likes"
				>
					<ThemedText
						style={[
							styles.likeCount,
							{ color: liked ? primary : secondaryText },
						]}
					>
						{post.likeCount ?? 0}
					</ThemedText>
				</TouchableOpacity>
			</View>
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
		marginBottom: 12,
	},
	actions: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 12,
	},
	likeButton: {
		flexDirection: "row",
		alignItems: "center",
		minHeight: 36,
		paddingRight: 6,
	},
	likeCountButton: {
		minHeight: 36,
		justifyContent: "center",
		paddingRight: 12,
	},
	likeCount: {
		fontSize: 14,
		fontWeight: "600",
	},
});
