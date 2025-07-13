import type { Meta, StoryObj } from "@storybook/react";
import MFlex from "../MFlex/MFlex";
import { MIconCamera } from "../MIcon/icons/MIconCamera";
import MTextarea from "./MTextarea";

const meta: Meta<typeof MTextarea> = {
	title: "Atoms/Form/MTextarea",
	component: MTextarea,
};

export default meta;

type Story = StoryObj<typeof MTextarea>;

const textareaDesc = () => (
	<MFlex>
		<MIconCamera mode="regular" width={20} /> Assistive text
	</MFlex>
);

const argTypes = {
	status: {
		control: {
			type: "select",
		},
		options: ["regular", "valid", "invalid"],
	},
	disabled: { control: { type: "boolean" } },
	maxWidth: { control: { type: "number" } },
};

export const Regular: Story = {
	args: {
		status: "regular",
		disabled: false,
		counter: true,
		maxLength: 200,
		placeholder: "Text area",
		description: textareaDesc(),
		label: "Textarea label",
		caption: "Textarea caption",
	},
	argTypes: argTypes,
};

export const Valid: Story = {
	args: {
		status: "valid",
		disabled: false,
		counter: true,
		maxLength: 200,
		placeholder: "Text area",
		description: textareaDesc(),
		label: "Textarea label",
		caption: "Textarea caption",
	},
	argTypes: argTypes,
};

export const Invalid: Story = {
	args: {
		status: "invalid",
		disabled: false,
		counter: true,
		maxLength: 200,
		placeholder: "Text area",
		description: textareaDesc(),
		label: "Textarea label",
		caption: "Textarea caption",
	},
	argTypes: argTypes,
};

export const Disabled: Story = {
	args: {
		status: "regular",
		disabled: true,
		counter: true,
		maxLength: 200,
		placeholder: "Text area",
		description: textareaDesc(),
		label: "Textarea label",
		caption: "Textarea caption",
	},
	argTypes: argTypes,
};
