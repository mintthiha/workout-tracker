import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

import { CreatePostModal } from "@/components/feed/CreatePostModal";
import { PostCard } from "@/components/feed/PostCard";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAppContext } from "@/src/context/AppContext";
import { getUserProfile } from "@/src/lib/userService";
import { createPost, subscribeToPosts } from "@/src/services/postService";
import { Post } from "@/src/types/workout";

export default function FeedScreen() {
	const { userId } = useAppContext();
	const [posts, setPosts] = useState<Post[]>([]);
	const [usernames, setUsernames] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);

	// Cache userIds we've already fetched so we don't re-fetch on every update
	const fetchedIds = useRef<Set<string>>(new Set());

	const accentColor = useThemeColor({ light: "#3498db", dark: "#3498db" }, "accent");
	const secondaryText = useThemeColor({ light: "#666666", dark: "#8e8e93" }, "secondaryText");

	// Subscribe to real-time posts
	useEffect(() => {
		const unsubscribe = subscribeToPosts(
			(incoming) => {
				setPosts(incoming);
				setLoading(false);

				// Fetch usernames for any new userIds we haven't seen yet
				const newIds = incoming
					.map((p) => p.userId)
					.filter((id) => !fetchedIds.current.has(id));

				newIds.forEach(async (id) => {
					fetchedIds.current.add(id);
					const profile = await getUserProfile(id);
					if (profile) {
						setUsernames((prev) => ({ ...prev, [id]: profile.username }));
					}
				});
			},
			(error) => {
				console.error("Feed error:", error);
				setLoading(false);
			},
		);
		return unsubscribe;
	}, []);

	async function handleCreatePost(content: string) {
		if (!userId) return;
		await createPost(userId, content);
	}

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color={accentColor} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={posts}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<PostCard
						post={item}
						username={usernames[item.userId] ?? "..."}
					/>
				)}
				contentContainerStyle={styles.list}
				ListHeaderComponent={
					<ThemedText type="title" style={styles.heading}>
						Feed
					</ThemedText>
				}
				ListEmptyComponent={
					<ThemedText style={[styles.empty, { color: secondaryText }]}>
						No posts yet. Be the first to post!
					</ThemedText>
				}
			/>

			<TouchableOpacity
				style={[styles.fab, { backgroundColor: accentColor }]}
				onPress={() => setModalVisible(true)}
			>
				<Ionicons name="add" size={28} color="#fff" />
			</TouchableOpacity>

			<CreatePostModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				onSubmit={handleCreatePost}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	list: {
		padding: 16,
		paddingBottom: 100,
	},
	heading: {
		marginBottom: 16,
	},
	empty: {
		textAlign: "center",
		marginTop: 40,
		fontSize: 15,
	},
	fab: {
		position: "absolute",
		bottom: 24,
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
	},
});
