// ─── Post Service ─────────────────────────────────────────────────────────────
// Handles Firestore reads/writes for feed posts.
// Path: posts/{postId}  — top-level collection shared across all users.

import {
	addDoc,
	collection,
	doc,
	increment,
	getDoc,
	onSnapshot,
	orderBy,
	query,
	runTransaction,
	serverTimestamp,
} from "firebase/firestore";

import { db } from "@/src/lib/firebase";
import { Post, PostMedia } from "@/src/types/workout";

interface CreatePostInput {
	userId: string;
	content: string;
	media?: PostMedia;
}

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Creates a new feed post in Firestore for the given user.
 */
export async function createPost({ userId, content, media }: CreatePostInput): Promise<void> {
	const trimmedContent = content.trim();
	const type = media ? (trimmedContent ? "media" : media.type) : "text";

	await addDoc(collection(db, "posts"), {
		userId,
		type,
		content: trimmedContent,
		...(media ? { media } : {}),
		createdAt: serverTimestamp(),
		likeCount: 0,
	});
}

// Likes are stored as posts/{postId}/likes/{userId}; the post keeps a counter
// so the feed can render counts without fetching every like document.
export async function togglePostLike(
	postId: string,
	userId: string,
	currentlyLiked: boolean,
): Promise<void> {
	const postRef = doc(db, "posts", postId);
	const likeRef = doc(db, "posts", postId, "likes", userId);

	await runTransaction(db, async (transaction) => {
		const likeSnap = await transaction.get(likeRef);
		const isLiked = likeSnap.exists();

		if (currentlyLiked || isLiked) {
			if (!isLiked) return;
			transaction.delete(likeRef);
			transaction.update(postRef, { likeCount: increment(-1) });
			return;
		}

		transaction.set(likeRef, { createdAt: serverTimestamp() });
		transaction.update(postRef, { likeCount: increment(1) });
	});
}

export async function isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
	const snap = await getDoc(doc(db, "posts", postId, "likes", userId));
	return snap.exists();
}

export function subscribeToPostLikeStatus(
	postId: string,
	userId: string,
	onData: (liked: boolean) => void,
	onError: (error: Error) => void,
): () => void {
	return onSnapshot(
		doc(db, "posts", postId, "likes", userId),
		(snap) => onData(snap.exists()),
		onError,
	);
}

// ─── Real-time Feed ───────────────────────────────────────────────────────────

/**
 * Subscribes to all posts ordered by newest first.
 * Returns an unsubscribe function; call it in useEffect cleanup.
 */
export function subscribeToPosts(
	onData: (posts: Post[]) => void,
	onError: (error: Error) => void,
): () => void {
	return onSnapshot(
		query(collection(db, "posts"), orderBy("createdAt", "desc")),
		(snap) =>
			onData(
				snap.docs.map((d) => ({
					id: d.id,
					...(d.data() as Omit<Post, "id">),
					createdAt: d.data().createdAt?.toMillis?.() ?? Date.now(),
					likeCount: d.data().likeCount ?? 0,
				})),
			),
		onError,
	);
}
