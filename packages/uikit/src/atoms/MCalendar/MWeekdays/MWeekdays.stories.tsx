import type { Meta, StoryObj } from "@storybook/react";
import MWeekdays from "./MWeekdays";

const meta: Meta<typeof MWeekdays> = {
	title: "Atoms/Visual/Calendar/MWeekdays",
	component: MWeekdays,
};

export default meta;

type Story = StoryObj<typeof MWeekdays>;

export const Default: Story = {
	args: {
		locale: "en-US",
		format: "narrow",
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
