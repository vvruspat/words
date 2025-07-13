import type { Meta, StoryObj } from "@storybook/react";
import MDaySelector from "./MDaySelector";

const meta: Meta<typeof MDaySelector> = {
	title: "Atoms/Visual/Calendar/MDaySelector",
	component: MDaySelector,
};

export default meta;

type Story = StoryObj<typeof MDaySelector>;

export const Default: Story = {
	args: {},

	argTypes: {},
};
