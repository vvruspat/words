import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import MList from "./MList";

const mockData = [
	{ key: "1", value: "Item 1" },
	{ key: "2", value: "Item 2" },
];
describe("MList Component", () => {
	test("renders list items from options", () => {
		const { getByText } = render(<MList options={mockData} showDivider />);
		expect(getByText("Item 1")).toBeInTheDocument();
		expect(getByText("Item 2")).toBeInTheDocument();
	});
});
