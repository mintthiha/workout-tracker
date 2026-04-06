import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { CreatePostModal } from "@/components/feed/CreatePostModal";

jest.mock("@/hooks/use-theme-color", () => ({
	useThemeColor: jest.fn(() => "#123456"),
}));

jest.mock("@/components/feed/FeedMedia", () => ({
	FeedMedia: () => null,
}));

jest.mock("@/src/lib/cloudinary", () => ({
	uploadToCloudinary: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
	MediaTypeOptions: { All: "All" },
	requestMediaLibraryPermissionsAsync: jest.fn(),
	launchImageLibraryAsync: jest.fn(),
}));

const { uploadToCloudinary } = jest.requireMock("@/src/lib/cloudinary") as {
	uploadToCloudinary: jest.Mock;
};

const imagePicker = jest.requireMock("expo-image-picker") as {
	requestMediaLibraryPermissionsAsync: jest.Mock;
	launchImageLibraryAsync: jest.Mock;
};

describe("CreatePostModal", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("submits a text-only post and closes the modal", async () => {
		const onSubmit = jest.fn().mockResolvedValue(undefined);
		const onClose = jest.fn();

		render(<CreatePostModal visible onClose={onClose} onSubmit={onSubmit} />);

		fireEvent.changeText(screen.getByPlaceholderText("What's on your mind?"), "  Hello feed  ");
		fireEvent.press(screen.getByText("Post"));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith({ content: "  Hello feed  ", media: undefined });
		});
		expect(onClose).toHaveBeenCalledTimes(1);
		expect(uploadToCloudinary).not.toHaveBeenCalled();
	});

	it("uploads selected media and submits it with the post", async () => {
		const onSubmit = jest.fn().mockResolvedValue(undefined);
		const onClose = jest.fn();

		imagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: "granted" });
		imagePicker.launchImageLibraryAsync.mockResolvedValue({
			canceled: false,
			assets: [
				{
					uri: "file:///image.jpg",
					type: "image",
					width: 1080,
					height: 1350,
				},
			],
		});
		uploadToCloudinary.mockResolvedValue({
			url: "https://cdn.example.com/image.jpg",
			publicId: "feed/image-1",
		});

		render(<CreatePostModal visible onClose={onClose} onSubmit={onSubmit} />);

		fireEvent.press(screen.getByText("Add image or video"));

		await waitFor(() => {
			expect(screen.getByText("Remove attachment")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Post"));

		await waitFor(() => {
			expect(uploadToCloudinary).toHaveBeenCalledWith("file:///image.jpg", "image");
		});
		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith({
				content: "",
				media: {
					type: "image",
					url: "https://cdn.example.com/image.jpg",
					publicId: "feed/image-1",
					width: 1080,
					height: 1350,
				},
			});
		});
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});