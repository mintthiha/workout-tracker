import { fireEvent, render, screen } from "@testing-library/react-native";

import { PostCard } from "@/components/feed/PostCard";
import { Post } from "@/src/types/workout";

jest.mock("@expo/vector-icons", () => ({
	Ionicons: () => null,
}));

jest.mock("expo-image", () => ({
	Image: () => null,
}));

jest.mock("@/hooks/use-theme-color", () => ({
	useThemeColor: jest.fn(() => "#123456"),
}));

jest.mock("@/components/feed/FeedMedia", () => ({
	FeedMedia: () => null,
}));

const post: Post = {
	id: "post-1",
	userId: "user-1",
	type: "text",
	content: "Good session today",
	createdAt: Date.UTC(2026, 0, 1),
	likeCount: 4,
};

describe("PostCard", () => {
	it("renders like count and calls the toggle handler", () => {
		const onToggleLike = jest.fn();

		render(
			<PostCard
				post={post}
				username="lifter"
				liked={false}
				onToggleLike={onToggleLike}
			/>,
		);

		expect(screen.getByText("4")).toBeTruthy();

		fireEvent.press(screen.getByLabelText("Like post"));

		expect(onToggleLike).toHaveBeenCalledWith(post);
	});

	it("calls the view likes handler from the like count", () => {
		const onViewLikes = jest.fn();

		render(<PostCard post={post} username="lifter" onViewLikes={onViewLikes} />);

		fireEvent.press(screen.getByLabelText("View post likes"));

		expect(onViewLikes).toHaveBeenCalledWith(post);
	});

	it("shows the unlike action when the user has liked the post", () => {
		render(<PostCard post={post} username="lifter" liked />);

		expect(screen.getByLabelText("Unlike post")).toBeTruthy();
	});
});
