import type { Meta, StoryObj } from "@storybook/react";

import MFieldDescription from "./MFieldDescription";

const meta: Meta<typeof MFieldDescription> = {
	title: "Atoms/Form/MFieldDescription",
	component: MFieldDescription,
};

export default meta;
type Story = StoryObj<typeof MFieldDescription>;

export const Basic: Story = {
	args: {
		children: "Description text",
	},

	argTypes: {
		children: {
			control: { type: "text" },
		},
	},
};
