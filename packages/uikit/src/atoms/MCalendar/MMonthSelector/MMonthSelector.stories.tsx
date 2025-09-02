import type { Meta, StoryObj } from "@storybook/react-vite";
import MMonthSelector from "./MMonthSelector";

const meta: Meta<typeof MMonthSelector> = {
	title: "Atoms/Visual/Calendar/MMonthSelector",
	component: MMonthSelector,
};

export default meta;

type Story = StoryObj<typeof MMonthSelector>;

export const Primary: Story = {
	args: {
		locale: "en-US",
		format: "long",
	},

	argTypes: {
		locale: {
			control: {
				type: "select",
				options: ["en-US", "ja-JP"],
			},
		},
		format: {
			control: {
				type: "select",
				options: ["narrow", "short", "long"],
			},
		},
	},
};
