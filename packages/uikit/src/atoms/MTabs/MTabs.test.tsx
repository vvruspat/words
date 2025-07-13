import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MTabs from "./MTabs";

interface MTabProps {
	label: string;
	active: boolean;
	onClick: () => void;
}

jest.mock("../MTab/MTab", () => ({ label, active, onClick }: MTabProps) => (
	<button
		type="button"
		data-testid="tab"
		className={active ? "active" : ""}
		onClick={onClick}
	>
		{label}
	</button>
));

describe("MTabs Component", () => {
	const items = [
		{ key: "tab1", label: "Tab 1", content: "Content 1" },
		{ key: "tab2", label: "Tab 2", content: "Content 2" },
		{ key: "tab3", label: "Tab 3", content: "Content 3" },
	];

	test("renders correctly with initial props", () => {
		render(<MTabs items={items} defaultActiveKey="tab1" />);
		expect(screen.getAllByTestId("tab")).toHaveLength(3);
		expect(screen.getByText("Content 1").closest("div")).toBeInTheDocument();
	});

	test("displays the correct tab content based on defaultActiveKey", () => {
		render(<MTabs items={items} defaultActiveKey="tab2" />);
		expect(screen.getByText("Content 2").closest("div")).toBeInTheDocument();
	});

	test("changes the active tab and displays corresponding content when a tab is clicked", () => {
		render(<MTabs items={items} defaultActiveKey="tab1" />);
		fireEvent.click(screen.getByText("Tab 2"));
		expect(screen.getByText("Content 2").closest("div")).toBeInTheDocument();
	});
});
