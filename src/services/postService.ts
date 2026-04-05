// ─── Post Service ─────────────────────────────────────────────────────────────
// Handles Firestore reads/writes for feed posts.
// Path: posts/{postId}  — top-level collection shared across all users.

import {
	addDoc,
	collection,
	onSnapshot,
	orderBy,
	query,
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
	});
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
				})),
			),
		onError,
	);
}
