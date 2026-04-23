# Explore Post Likes Plan

## Existing Data Model

The app already has user-backed authentication and profile data:

- Firebase Auth provides the signed-in user's UID.
- User profiles are stored at `users/{userId}`.
- Feed posts are stored in the top-level `posts` collection.
- Each post already stores the creating user's `userId`.

Because posts and signed-in users are already connected by UID, no new users table is needed before adding post likes.

## Recommended Firestore Shape

Use a likes subcollection per post:

```text
posts/{postId}
  userId
  type
  content
  media?
  createdAt
  likeCount

posts/{postId}/likes/{userId}
  createdAt
```

Why this shape:

- `posts/{postId}/likes/{userId}` prevents duplicate likes by the same user.
- `likeCount` on the post keeps feed rendering simple and fast.
- The model scales better than storing all liked user IDs in a single post array.

## Code Changes Needed

### Types

Update `src/types/workout.ts`:

- Add `likeCount: number` or `likeCount?: number` to the `Post` interface.

### Post Creation

Update `src/services/postService.ts`:

- Initialize new posts with `likeCount: 0`.

### Like Service Logic

Add functions to `src/services/postService.ts`:

- `togglePostLike(postId: string, userId: string, currentlyLiked: boolean)`
- `isPostLikedByUser(postId: string, userId: string)`
- Optionally `subscribeToPostLikeStatus(postId: string, userId: string, onData: (liked: boolean) => void)`

Implementation should:

- Create `posts/{postId}/likes/{userId}` when liking.
- Delete `posts/{postId}/likes/{userId}` when unliking.
- Increment or decrement `posts/{postId}.likeCount`.
- Prefer a Firestore transaction or batched write so the like document and count stay in sync.

### Explore Screen

Update `app/(tabs)/explore.tsx`:

- Track which posts the current user has liked.
- Pass like state and a toggle handler into `PostCard`.
- Require `userId` before allowing a like.

### Post Card UI

Update `components/feed/PostCard.tsx`:

- Add a like button.
- Display `post.likeCount`.
- Render a filled heart when the current user liked the post.
- Call the toggle handler when pressed.

Suggested props:

```ts
interface Props {
  post: Post;
  username: string;
  avatarUrl?: string;
  liked?: boolean;
  onToggleLike?: (post: Post) => void;
}
```

## Security Rules Considerations

Firestore rules should enforce:

- Only authenticated users can like or unlike.
- A user can only write their own like document: `posts/{postId}/likes/{request.auth.uid}`.
- `likeCount` should not be arbitrarily editable by clients outside the expected like flow.

If strict counter integrity is required, move count updates to a Cloud Function instead of trusting client-side writes.

## Test Coverage

Recommended tests:

- `togglePostLike` creates a like and increments `likeCount`.
- `togglePostLike` removes a like and decrements `likeCount`.
- `PostCard` shows the correct icon and count for liked/unliked states.
- Explore passes the signed-in user's like state into each rendered post.
