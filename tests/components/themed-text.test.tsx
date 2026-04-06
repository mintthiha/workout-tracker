import { render, screen } from "@testing-library/react-native";

import { ThemedText } from "@/components/themed-text";

jest.mock("@/hooks/use-theme-color", () => ({
	useThemeColor: jest.fn(() => "#123456"),
}));

describe("ThemedText", () => {
	it("renders children with the resolved theme color", () => {
		render(<ThemedText>Hello Lift Up</ThemedText>);

		const text = screen.getByText("Hello Lift Up");
		expect(text).toBeTruthy();
		expect(text).toHaveStyle({ color: "#123456" });
	});

	it("applies the selected text variant styles", () => {
		render(<ThemedText type="title">Title</ThemedText>);

		expect(screen.getByText("Title")).toHaveStyle({
			fontSize: 32,
			fontWeight: "bold",
		});
	});
});
