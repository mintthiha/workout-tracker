import { ActivityIndicator, TouchableOpacity } from "react-native";
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
	subscribeToPosts: jest.fn(),
}));

jest.mock("@/components/feed/PostCard", () => ({
	PostCard: ({ post, username }: { post: { content: string }; username: string }) => {
		const { Text } = require("react-native");
		return <Text>{`${username}: ${post.content}`}</Text>;
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
		const { Text, TouchableOpacity } = require("react-native");
		return visible ? (
			<TouchableOpacity onPress={() => onSubmit({ content: "Fresh post" })}>
				<Text>Mock submit post</Text>
			</TouchableOpacity>
		) : null;
	},
}));

const { useAppContext } = jest.requireMock("@/src/context/AppContext") as {
	useAppContext: jest.Mock;
};

const { getUserProfile } = jest.requireMock("@/src/lib/userService") as {
	getUserProfile: jest.Mock;
};

const { createPost, subscribeToPosts } = jest.requireMock("@/src/services/postService") as {
	createPost: jest.Mock;
	subscribeToPosts: jest.Mock;
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
				},
			]);
			return jest.fn();
		});

		getUserProfile.mockResolvedValue({
			username: "teammate",
			avatarUrl: "https://cdn.example.com/teammate.jpg",
		});
		createPost.mockResolvedValue(undefined);

		const { UNSAFE_getAllByType, UNSAFE_queryByType } = render(<FeedScreen />);

		await waitFor(() => {
			expect(screen.getByText("teammate: Existing post")).toBeTruthy();
		});
		expect(screen.getByText("1 post")).toBeTruthy();

		const buttons = UNSAFE_getAllByType(TouchableOpacity);
		fireEvent.press(buttons[0]);

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
});
