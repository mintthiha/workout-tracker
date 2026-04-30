import { fireEvent, render, screen } from "@testing-library/react-native";

import { PostLikesModal } from "@/components/feed/PostLikesModal";

jest.mock("@expo/vector-icons", () => ({
	Ionicons: () => null,
}));

jest.mock("expo-image", () => ({
	Image: () => null,
}));

jest.mock("@/hooks/use-theme-color", () => ({
	useThemeColor: jest.fn(() => "#123456"),
}));

describe("PostLikesModal", () => {
	it("renders liker profiles and closes", () => {
		const onClose = jest.fn();

		render(
			<PostLikesModal
				visible
				loading={false}
				onClose={onClose}
				likers={[
					{
						userId: "user-1",
						username: "mint",
						firstName: "Mint",
						lastName: "Thiha",
					},
				]}
			/>,
		);

		expect(screen.getByText("Liked by")).toBeTruthy();
		expect(screen.getByText("mint")).toBeTruthy();
		expect(screen.getByText("Mint Thiha")).toBeTruthy();

		fireEvent.press(screen.getByLabelText("Close likes"));

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("renders an empty state", () => {
		render(<PostLikesModal visible loading={false} onClose={jest.fn()} likers={[]} />);

		expect(screen.getByText("No likes yet")).toBeTruthy();
	});
});
