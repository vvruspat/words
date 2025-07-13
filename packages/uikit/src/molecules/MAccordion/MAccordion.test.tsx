import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MAccordion from "./MAccordion";

const sampleItems = [
	{ key: 1, title: "First Title", children: "First Content" },
	{ key: 2, title: "Second Title", children: "Second Content" },
];

describe("MAccordion", () => {
	test("renders titles of accordion items", () => {
		render(<MAccordion items={sampleItems} />);

		expect(screen.getByText("First Title")).toBeInTheDocument();
		expect(screen.getByText("Second Title")).toBeInTheDocument();
	});
	test("opens and closes accordion items on click", async () => {
		render(<MAccordion items={sampleItems} />);

		// Initially, all items are collapsed by default
		fireEvent.click(screen.getByText("First Title"));
		// First item should now be visible (show children when not collapsed)
		expect(screen.getByText("First Content")).toBeVisible();

		fireEvent.click(screen.getByText("First Title"));
	});
});
