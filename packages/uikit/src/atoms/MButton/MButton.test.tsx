import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import MButton from "./MButton";

describe("MButton", () => {
	test("render button", async () => {
		const handleClick = jest.fn();

		render(
			<MButton mode="primary" onClick={handleClick}>
				Button Text
			</MButton>,
		);

		expect(screen.getByText("Button Text")).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalled();
	});

	test("disabled button", async () => {
		const handleClick = jest.fn();

		render(
			<MButton disabled={true} mode="primary" onClick={handleClick}>
				Button Text
			</MButton>,
		);

		await userEvent.click(screen.getByRole("button"));

		expect(screen.getByRole("button")).toBeDisabled();
		expect(handleClick).not.toHaveBeenCalled();
	});
});
