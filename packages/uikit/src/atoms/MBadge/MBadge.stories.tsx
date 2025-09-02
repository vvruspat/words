import type { Meta, StoryObj } from "@storybook/react-vite";

import { MIconStar } from "../MIcon/icons/MIconStar";
import MBadge from "./MBadge";

const meta: Meta<typeof MBadge> = {
	title: "Atoms/Visual/MBadge",
	component: MBadge,
};

export default meta;

type Story = StoryObj<typeof MBadge>;

export const Primary: Story = {
	args: {
		children: (
			<>
				<MIconStar mode="regular" width={20} />
				4.8
			</>
		),
		mode: "primary",
	},

	argTypes: {
		mode: {
			options: ["primary", "transparent"],
			control: { type: "select" },
		},
	},
};

export const Transparent: Story = {
	args: {
		children: (
			<>
				<MIconStar mode="regular" width={16} />
				4.8
			</>
		),
		mode: "transparent",
	},

	argTypes: {
		mode: {
			options: ["primary", "transparent"],
			control: { type: "select" },
		},
	},
};
