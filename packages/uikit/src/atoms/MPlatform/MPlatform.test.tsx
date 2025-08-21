import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MPlatform } from "./MPlatform";

// Mock usePlatform
jest.mock("../../hooks/usePlatform", () => ({
	__esModule: true,
	default: jest.fn(),
}));

import usePlatform from "../../hooks/usePlatform";

const mockedUsePlatform = usePlatform as jest.Mock;

describe("MPlatform", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	const Child = () => <div>Platform Specific Content</div>;

	it("renders children if platform matches exactly", () => {
		mockedUsePlatform.mockReturnValue("mobile");

		render(
			<MPlatform platform="mobile">
				<Child />
			</MPlatform>,
		);
		expect(screen.getByText("Platform Specific Content")).toBeInTheDocument();
	});

	it("does not render children if platform does not match", () => {
		mockedUsePlatform.mockReturnValue("desktop");

		render(
			<MPlatform platform="mobile">
				<Child />
			</MPlatform>,
		);
		expect(
			screen.queryByText("Platform Specific Content"),
		).not.toBeInTheDocument();
	});

	it("renders for 'mobile-and-tablet' on mobile", () => {
		mockedUsePlatform.mockReturnValue("mobile");

		render(
			<MPlatform platform="mobile-and-tablet">
				<Child />
			</MPlatform>,
		);
		expect(screen.getByText("Platform Specific Content")).toBeInTheDocument();
	});

	it("renders for 'mobile-and-tablet' on tablet", () => {
		mockedUsePlatform.mockReturnValue("tablet");

		render(
			<MPlatform platform="mobile-and-tablet">
				<Child />
			</MPlatform>,
		);
		expect(screen.getByText("Platform Specific Content")).toBeInTheDocument();
	});

	it("does not render for 'mobile-and-tablet' on desktop", () => {
		mockedUsePlatform.mockReturnValue("desktop");

		render(
			<MPlatform platform="mobile-and-tablet">
				<Child />
			</MPlatform>,
		);
		expect(
			screen.queryByText("Platform Specific Content"),
		).not.toBeInTheDocument();
	});

	it("does not render for 'mobile-and-tablet' on server", () => {
		mockedUsePlatform.mockReturnValue("server");

		render(
			<MPlatform platform="mobile-and-tablet">
				<Child />
			</MPlatform>,
		);
		expect(
			screen.queryByText("Platform Specific Content"),
		).not.toBeInTheDocument();
	});

	it("defaults to 'desktop' if platform prop is not provided", () => {
		mockedUsePlatform.mockReturnValue("desktop");

		render(
			<MPlatform>
				<Child />
			</MPlatform>,
		);
		expect(screen.getByText("Platform Specific Content")).toBeInTheDocument();
	});
});
