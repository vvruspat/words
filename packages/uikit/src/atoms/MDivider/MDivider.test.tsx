import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MDivider from "./MDivider";

describe("MDivider", () => {
	test("render card", async () => {
		const _handleClick = jest.fn();

		render(<MDivider data-testid="divider" />);
		expect(screen.getByTestId("divider")).toBeInTheDocument();
	});
});
