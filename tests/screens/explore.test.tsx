import { ActivityIndicator } from "react-native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import FeedScreen from "@/app/(tabs)/explore";

jest.mock("@expo/vector-icons", () => ({
	Ionicons: () => null,
}));

jest.mock("@/hooks/use-theme-color", () => ({
	useThemeColor: jest.fn(() => "#123456"),
}));

jest.mock("@/src/context/AppContext", () => ({
	useAppContext: jest.fn(),
}));

jest.mock("@/src/lib/userService", () => ({
	getUserProfile: jest.fn(),
}));

jest.mock("@/src/services/postService", () => ({
	createPost: jest.fn(),
	getPostLikes: jest.fn(),
	subscribeToPostLikeStatus: jest.fn(),
	subscribeToPosts: jest.fn(),
	togglePostLike: jest.fn(),
}));

jest.mock("@/components/feed/PostCard", () => ({
	PostCard: ({
		post,
		username,
		liked,
		onToggleLike,
		onViewLikes,
	}: {
		post: { content: string };
		username: string;
		liked: boolean;
		onToggleLike: (post: unknown) => void;
		onViewLikes: (post: unknown) => void;
	}) => {
		const React = jest.requireActual("react");
		const { Text, TouchableOpacity } = jest.requireActual("react-native");
		return React.createElement(
			TouchableOpacity,
			{ onPress: () => onToggleLike(post), onLongPress: () => onViewLikes(post) },
			React.createElement(Text, null, `${username}: ${post.content}${liked ? " liked" : ""}`),
		);
	},
}));

jest.mock("@/components/feed/CreatePostModal", () => ({
	CreatePostModal: ({
		visible,
		onSubmit,
	}: {
		visible: boolean;
		onSubmit: (input: { content: string }) => Promise<void>;
	}) => {
		const React = jest.requireActual("react");
		const { Text, TouchableOpacity } = jest.requireActual("react-native");
		return visible
			? React.createElement(
					TouchableOpacity,
					{ onPress: () => onSubmit({ content: "Fresh post" }) },
					React.createElement(Text, null, "Mock submit post"),
				)
			: null;
	},
}));

jest.mock("@/components/feed/PostLikesModal", () => ({
	PostLikesModal: ({
		visible,
		loading,
		likers,
	}: {
		visible: boolean;
		loading: boolean;
		likers: { username: string }[];
	}) => {
		const React = jest.requireActual("react");
		const { Text } = jest.requireActual("react-native");
		if (!visible) return null;
		return React.createElement(
			Text,
			null,
			loading ? "Loading likes" : likers.map((liker) => liker.username).join(", "),
		);
	},
}));

const { useAppContext } = jest.requireMock("@/src/context/AppContext") as {
	useAppContext: jest.Mock;
};

const { getUserProfile } = jest.requireMock("@/src/lib/userService") as {
	getUserProfile: jest.Mock;
};

const { createPost, getPostLikes, subscribeToPostLikeStatus, subscribeToPosts, togglePostLike } =
	jest.requireMock("@/src/services/postService") as {
	createPost: jest.Mock;
	getPostLikes: jest.Mock;
	subscribeToPostLikeStatus: jest.Mock;
	subscribeToPosts: jest.Mock;
	togglePostLike: jest.Mock;
};

describe("FeedScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("shows the signed-out message once auth is loaded and there is no user", () => {
		useAppContext.mockReturnValue({
			userId: null,
			userProfile: null,
			isLoaded: true,
		});

		render(<FeedScreen />);

		expect(screen.getByText("Feed is for members.")).toBeTruthy();
		expect(
			screen.getByText("To view what other lifters are posting on Lift Up, sign up or log in now!"),
		).toBeTruthy();
	});

	it("renders feed data from the subscription and creates a post through the modal callback", async () => {
		useAppContext.mockReturnValue({
			userId: "user-1",
			userProfile: { avatarUrl: "https://cdn.example.com/avatar.jpg" },
			isLoaded: true,
		});

		subscribeToPosts.mockImplementation((onData: (posts: unknown[]) => void) => {
			onData([
				{
					id: "post-1",
					userId: "user-2",
					type: "text",
					content: "Existing post",
					createdAt: Date.now(),
					likeCount: 0,
				},
			]);
			return jest.fn();
		});
		subscribeToPostLikeStatus.mockImplementation(
			(_postId: string, _userId: string, onData: (liked: boolean) => void) => {
				onData(false);
				return jest.fn();
			},
		);

		getUserProfile.mockResolvedValue({
			username: "teammate",
			avatarUrl: "https://cdn.example.com/teammate.jpg",
		});
		createPost.mockResolvedValue(undefined);

		const { UNSAFE_queryByType } = render(<FeedScreen />);

		await waitFor(() => {
			expect(screen.getByText("teammate: Existing post")).toBeTruthy();
		});
		expect(screen.getByText("1 post")).toBeTruthy();

		fireEvent.press(screen.getByLabelText("Create post"));

		await waitFor(() => {
			expect(screen.getByText("Mock submit post")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Mock submit post"));

		await waitFor(() => {
			expect(createPost).toHaveBeenCalledWith({
				userId: "user-1",
				content: "Fresh post",
				media: undefined,
			});
		});

		expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
	});

	it("toggles a post like using the current user's like state", async () => {
		useAppContext.mockReturnValue({
			userId: "user-1",
			userProfile: { avatarUrl: "https://cdn.example.com/avatar.jpg" },
			isLoaded: true,
		});

		subscribeToPosts.mockImplementation((onData: (posts: unknown[]) => void) => {
			onData([
				{
					id: "post-1",
					userId: "user-2",
					type: "text",
					content: "Existing post",
					createdAt: Date.now(),
					likeCount: 2,
				},
			]);
			return jest.fn();
		});
		subscribeToPostLikeStatus.mockImplementation(
			(_postId: string, _userId: string, onData: (liked: boolean) => void) => {
				onData(true);
				return jest.fn();
			},
		);
		getUserProfile.mockResolvedValue({ username: "teammate" });
		togglePostLike.mockResolvedValue(undefined);

		render(<FeedScreen />);

		await waitFor(() => {
			expect(screen.getByText("teammate: Existing post liked")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("teammate: Existing post liked"));

		await waitFor(() => {
			expect(togglePostLike).toHaveBeenCalledWith("post-1", "user-1", true);
		});
	});

	it("opens the liked-by modal with liker profiles", async () => {
		useAppContext.mockReturnValue({
			userId: "user-1",
			userProfile: { avatarUrl: "https://cdn.example.com/avatar.jpg" },
			isLoaded: true,
		});

		subscribeToPosts.mockImplementation((onData: (posts: unknown[]) => void) => {
			onData([
				{
					id: "post-1",
					userId: "user-2",
					type: "text",
					content: "Existing post",
					createdAt: Date.now(),
					likeCount: 1,
				},
			]);
			return jest.fn();
		});
		subscribeToPostLikeStatus.mockImplementation(
			(_postId: string, _userId: string, onData: (liked: boolean) => void) => {
				onData(false);
				return jest.fn();
			},
		);
		getPostLikes.mockResolvedValue([{ userId: "user-3", createdAt: Date.now() }]);
		getUserProfile.mockImplementation((id: string) =>
			Promise.resolve({ username: id === "user-3" ? "spotter" : "teammate" }),
		);

		render(<FeedScreen />);

		await waitFor(() => {
			expect(screen.getByText("teammate: Existing post")).toBeTruthy();
		});

		fireEvent(screen.getByText("teammate: Existing post"), "longPress");

		await waitFor(() => {
			expect(screen.getByText("spotter")).toBeTruthy();
		});
		expect(getPostLikes).toHaveBeenCalledWith("post-1");
	});
});
