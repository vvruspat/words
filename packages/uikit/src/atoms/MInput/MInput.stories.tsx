import type { ArgTypes, Meta, StoryObj } from "@storybook/react-vite";

import { MIconBracketsSquare } from "../MIcon/icons/MIconBracketsSquare";
import MInput from "./MInput";

const meta: Meta<typeof MInput> = {
	title: "Atoms/Form/MInput",
	component: MInput,
};

export default meta;

type Story = StoryObj<typeof MInput>;

const argTypes: ArgTypes<typeof MInput> = {
	type: {
		control: {
			type: "select",
		},
		options: ["text", "email", "password", "number", "tel"],
	},
	status: {
		control: {
			type: "select",
		},
		options: ["regular", "valid", "invalid"],
	},
	disabled: { control: { type: "boolean" } },
	before: {
		control: { type: "text" },
	},
	placeholder: {
		control: { type: "text" },
	},
	after: {
		control: { type: "text" },
	},
	label: {
		control: { type: "text" },
	},
	caption: {
		control: { type: "text" },
	},
	description: {
		control: { type: "text" },
	},
};

export const Regular: Story = {
	args: {
		status: "regular",
		disabled: false,
		children: "BUTTON",
		before: <MIconBracketsSquare mode="regular" width={24} />,
		after: <MIconBracketsSquare mode="regular" width={24} />,
		placeholder: "Placeholder",
	},

	argTypes: argTypes,
};

export const Valid: Story = {
	args: {
		status: "valid",
		disabled: false,
		children: "BUTTON",
		before: <MIconBracketsSquare mode="regular" width={24} />,
		after: <MIconBracketsSquare mode="regular" width={24} />,
		placeholder: "Placeholder",
	},

	argTypes: argTypes,
};

export const Invalid: Story = {
	args: {
		status: "invalid",
		disabled: false,
		children: "BUTTON",
		before: <MIconBracketsSquare mode="regular" width={24} />,
		after: <MIconBracketsSquare mode="regular" width={24} />,
		placeholder: "Placeholder",
	},

	argTypes: argTypes,
};

export const Disabled: Story = {
	args: {
		status: "regular",
		disabled: true,
		children: "BUTTON",
		before: <MIconBracketsSquare mode="regular" width={24} />,
		after: <MIconBracketsSquare mode="regular" width={24} />,
		placeholder: "Placeholder",
	},

	argTypes: argTypes,
};
