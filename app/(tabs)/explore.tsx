import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

import { CreatePostModal } from "@/components/feed/CreatePostModal";
import { PostCard } from "@/components/feed/PostCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAppContext } from "@/src/context/AppContext";
import { getUserProfile } from "@/src/lib/userService";
import { createPost, subscribeToPosts } from "@/src/services/postService";
import { Post, PostMedia } from "@/src/types/workout";

export default function FeedScreen() {
	const { userId, userProfile } = useAppContext();
	const [posts, setPosts] = useState<Post[]>([]);
	const [usernames, setUsernames] = useState<Record<string, string>>({});
	const [avatars, setAvatars] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);

	const fetchedIds = useRef<Set<string>>(new Set());

	const primary = useThemeColor({}, "primary");
	const secondaryText = useThemeColor({}, "secondaryText");
	const tertiaryText = useThemeColor({}, "tertiaryText");

	// Keep the current user's avatar in sync with their profile in AppContext
	useEffect(() => {
		if (!userId || !userProfile) return;
		setAvatars((prev) => ({ ...prev, [userId]: userProfile.avatarUrl ?? "" }));
	}, [userId, userProfile]);

	// Subscribe to real-time posts — re-runs when userId changes so the
	// listener is established only after auth is ready.
	useEffect(() => {
		if (!userId) return;

		setLoading(true);
		fetchedIds.current.clear();

		const unsubscribe = subscribeToPosts(
			(incoming) => {
				setPosts(incoming);
				setLoading(false);

				const newIds = incoming
					.map((p) => p.userId)
					.filter((id) => !fetchedIds.current.has(id));

				newIds.forEach(async (id) => {
					fetchedIds.current.add(id);
					const profile = await getUserProfile(id);
					if (profile) {
						setUsernames((prev) => ({ ...prev, [id]: profile.username }));
						if (profile.avatarUrl) {
							setAvatars((prev) => ({ ...prev, [id]: profile.avatarUrl! }));
						}
					}
				});
			},
			(error) => {
				console.error("Feed error:", error);
				setLoading(false);
			},
		);
		return unsubscribe;
	}, [userId]);

	async function handleCreatePost(input: { content: string; media?: PostMedia }) {
		if (!userId) return;
		await createPost({ userId, content: input.content, media: input.media });
	}

	if (loading) {
		return (
			<ThemedView style={styles.centered}>
				<ActivityIndicator size="large" color={primary} />
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<FlatList
				data={posts}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<PostCard
						post={item}
						username={usernames[item.userId] ?? "..."}
						avatarUrl={avatars[item.userId]}
					/>
				)}
				contentContainerStyle={styles.list}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<View style={styles.header}>
						<ThemedText style={styles.heading}>Feed</ThemedText>
						<ThemedText style={[styles.subheading, { color: tertiaryText }]}>
							{posts.length > 0
								? `${posts.length} post${posts.length !== 1 ? "s" : ""}`
								: ""}
						</ThemedText>
					</View>
				}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Ionicons name="newspaper-outline" size={52} color={tertiaryText} />
						<ThemedText style={[styles.emptyTitle, { color: secondaryText }]}>
							Nothing here yet
						</ThemedText>
						<ThemedText style={[styles.emptySubtitle, { color: tertiaryText }]}>
							Be the first to post something!
						</ThemedText>
					</View>
				}
			/>

			<TouchableOpacity
				style={[styles.fab, { backgroundColor: primary }]}
				onPress={() => setModalVisible(true)}
			>
				<Ionicons name="add" size={28} color="#fff" />
			</TouchableOpacity>

			<CreatePostModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				onSubmit={handleCreatePost}
			/>
		</ThemedView>
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
		paddingHorizontal: 16,
		paddingTop: 60,
		paddingBottom: 100,
	},
	header: {
		marginBottom: 20,
	},
	heading: {
		fontSize: 36,
		fontWeight: "800",
		letterSpacing: -0.8,
	},
	subheading: {
		fontSize: 13,
		fontWeight: "600",
		letterSpacing: 0.3,
		marginTop: 2,
	},
	emptyState: {
		alignItems: "center",
		paddingTop: 80,
		gap: 12,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "700",
		letterSpacing: -0.3,
	},
	emptySubtitle: {
		fontSize: 15,
		textAlign: "center",
	},
	fab: {
		position: "absolute",
		bottom: 24,
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 10,
		elevation: 6,
	},
});
