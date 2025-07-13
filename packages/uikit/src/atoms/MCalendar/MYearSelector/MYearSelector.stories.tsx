import type { Meta, StoryObj } from "@storybook/react";
import MYearSelector from "./MYearSelector";

const meta: Meta<typeof MYearSelector> = {
	title: "Atoms/Visual/Calendar/MYearSelector",
	component: MYearSelector,
};

export default meta;

type Story = StoryObj<typeof MYearSelector>;

export const Default: Story = {
	args: {},

	argTypes: {},
};
