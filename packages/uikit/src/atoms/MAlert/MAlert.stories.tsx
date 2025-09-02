import type { Meta, StoryObj } from "@storybook/react-vite";

import MAlert from "./MAlert";

const meta: Meta<typeof MAlert> = {
	title: "Atoms/Layout/MAlert",
	component: MAlert,
};

export default meta;
type Story = StoryObj<typeof MAlert>;

export const Basic: Story = {
	args: {
		mode: "info",
		children: "This is an alert",
	},

	argTypes: {
		mode: {
			control: { type: "select" },
			options: ["info", "success", "warning", "error"],
		},
	},
};
