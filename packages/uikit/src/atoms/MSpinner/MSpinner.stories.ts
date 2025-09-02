import type { Meta, StoryObj } from "@storybook/react-vite";

import MSpinner from "./MSpinner";

const meta: Meta<typeof MSpinner> = {
	title: "Atoms/Layout/MSpinner",
	component: MSpinner,
};

export default meta;

type Story = StoryObj<typeof MSpinner>;

export const Regular: Story = {
	args: {
		size: "xl",
		mode: "primary",
	},
	argTypes: {
		size: {
			control: { type: "select" },
			options: ["xs", "s", "m", "l", "xl", "3xl", "4xl"],
		},
		mode: {
			control: { type: "select" },
			options: ["base", "primary", "secondary", "tertiary"],
		},
	},
};
