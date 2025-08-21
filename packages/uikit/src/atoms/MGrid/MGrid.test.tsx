import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MGrid from "./MGrid";

describe("MGrid", () => {
	it("renders children", () => {
		render(
			<MGrid>
				<span data-testid="child">Child</span>
			</MGrid>,
		);
		expect(screen.getByTestId("child")).toBeInTheDocument();
	});

	it("renders with the correct tag", () => {
		render(
			<MGrid tag="section" data-testid="grid-section">
				Section content
			</MGrid>,
		);
		const el = screen.getByTestId("grid-section");
		expect(el.tagName.toLowerCase()).toBe("section");
	});

	it("applies custom className", () => {
		render(
			<MGrid className="custom-class" data-testid="grid-custom">
				Content
			</MGrid>,
		);
		expect(screen.getByTestId("grid-custom")).toHaveClass("custom-class");
	});

	it("applies grid styles from props", () => {
		render(
			<MGrid
				columnTemplate="repeat(2, 1fr)"
				rowTemplate="repeat(3, 1fr)"
				rowGap="xl"
				columnGap="xl"
				alignItems="center"
				justifyItems="end"
				data-testid="grid-style"
			>
				<div>1</div>
				<div>2</div>
			</MGrid>,
		);
		const el = screen.getByTestId("grid-style");
		expect(el).toHaveStyle({
			display: "grid",
			gridTemplateColumns: "repeat(2, 1fr)",
			gridTemplateRows: "repeat(3, 1fr)",
			justifyItems: "end",
			alignItems: "center",
		});
	});

	it("defaults to div if tag is not provided", () => {
		render(<MGrid data-testid="grid-default" />);
		const el = screen.getByTestId("grid-default");
		expect(el.tagName.toLowerCase()).toBe("div");
	});
});
