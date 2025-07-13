import type { Meta, StoryObj } from "@storybook/react";
import MCalendar from "./MCalendar";

const meta: Meta<typeof MCalendar> = {
	title: "Atoms/Visual/Calendar/MCalendar",
	component: MCalendar,
};

export default meta;

type Story = StoryObj<typeof MCalendar>;

export const Default: Story = {
	args: {},

	argTypes: {},
};
