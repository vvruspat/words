import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MFileInputModal } from "./MFileInputModal";

describe("MFileInputModal", () => {
	const files = [
		new File(["1"], "one.txt", { type: "text/plain" }),
		new File(["2"], "two.png", { type: "image/png" }),
	];
	const onDropped = jest.fn();
	const onRemoved = jest.fn();
	const onReset = jest.fn();
	const onClose = jest.fn();
	const fakeRef = { current: document.createElement("input") };
	fakeRef.current.type = "file";
	fakeRef.current.accept = "text/plain,image/png";
	fakeRef.current.multiple = true;

	it("is hidden when open=false", () => {
		const { container } = render(
			<MFileInputModal
				open={false}
				files={files}
				onFilesDropped={onDropped}
				onFileRemoved={onRemoved}
				onFilesReset={onReset}
				onClose={onClose}
				inputRef={fakeRef}
			/>,
		);
		const overlay = container.querySelector(".overlay");
		expect(overlay).not.toHaveClass("open");
	});

	it("shows files and calls onFileRemoved", () => {
		render(
			<MFileInputModal
				open
				files={files}
				onFilesDropped={onDropped}
				onFileRemoved={onRemoved}
				onFilesReset={onReset}
				onClose={onClose}
				inputRef={fakeRef}
			/>,
		);

		// each filename should be rendered
		expect(screen.getByText("one.txt")).toBeInTheDocument();
		expect(screen.getByText("two.png")).toBeInTheDocument();
	});

	it("calls onFilesDropped when files are dropped", () => {
		render(
			<MFileInputModal
				open
				files={[]}
				onFilesDropped={onDropped}
				onFileRemoved={onRemoved}
				onFilesReset={onReset}
				onClose={onClose}
				inputRef={fakeRef}
			/>,
		);
		const dropArea = screen.getByTestId("drop-area");
		const dt = {
			dataTransfer: { files: [files[0]] },
		};
		fireEvent.drop(dropArea, dt);
		expect(onDropped).toHaveBeenCalledWith([files[0]]);
	});

	it("calls onFileRemoved when its remove button is clicked", () => {
		render(
			<MFileInputModal
				open
				files={files}
				onFilesDropped={onDropped}
				onFileRemoved={onRemoved}
				onFilesReset={onReset}
				onClose={onClose}
				inputRef={fakeRef}
			/>,
		);

		const removeOne = screen.getByLabelText("Remove one.txt");
		fireEvent.click(removeOne);

		expect(onRemoved).toHaveBeenCalledWith("one.txt");
	});
});
