import type { Meta, StoryObj } from "@storybook/react";

import MButton from "./MButton";

const meta: Meta<typeof MButton> = {
	title: "Atoms/Form/MButton",
	component: MButton,
};

export default meta;
type Story = StoryObj<typeof MButton>;

export const Basic: Story = {
	args: {
		disabled: false,
		children: "Create",
		mode: "primary",
		before: "+",
		after: "",
		size: "m",
	},

	argTypes: {
		disabled: { control: { type: "boolean" } },
		mode: {
			options: [
				"primary",
				"secondary",
				"tertiary",
				"round",
				"outlined",
				"transparent",
			],
			control: { type: "select" },
		},
		before: {
			control: { type: "text" },
		},
		after: {
			control: { type: "text" },
		},
		size: {
			options: ["s", "m", "l"],
			control: { type: "select" },
		},
	},
};
