# Post Likes Implementation Summary

## Added Capabilities

- Users can like and unlike posts in the Explore feed.
- Each post displays its current like count.
- Users can tap the like count to see who liked the post.

## Firestore Data

Likes are stored under each post:

```text
posts/{postId}/likes/{userId}
  createdAt
```

The post document also stores:

```text
likeCount
```

`likeCount` is used for fast feed rendering. The liker list is loaded on demand when the user opens the liked-by modal.

## App Changes

- `src/services/postService.ts`
  - Creates posts with `likeCount: 0`.
  - Toggles likes using `posts/{postId}/likes/{userId}`.
  - Subscribes to the current user's like status per post.
  - Reads all likes for a post through `getPostLikes`.

- `app/(tabs)/explore.tsx`
  - Tracks liked state for visible posts.
  - Toggles likes for the signed-in user.
  - Loads liker IDs, fetches their user profiles, and opens the liked-by modal.

- `components/feed/PostCard.tsx`
  - Adds a heart button for like/unlike.
  - Makes the like count tappable.

- `components/feed/PostLikesModal.tsx`
  - Shows the users who liked a post with avatar, username, and name when available.

## Tests

Added or updated tests for:

- Post card like toggling.
- Opening the liked-by flow from Explore.
- Rendering liker profiles in the liked-by modal.
