import type { Meta, StoryObj } from "@storybook/react-vite";

import MAvatar from "./MAvatar";

const meta: Meta<typeof MAvatar> = {
	title: "Atoms/Layout/MAvatar",
	component: MAvatar,
};

export default meta;
type Story = StoryObj<typeof MAvatar>;

export const Basic: Story = {
	args: {
		size: "2xl",
		src: "https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_1280.jpg",
	},

	argTypes: {
		size: {
			control: { type: "select" },
			options: ["xs", "s", "m", "l", "xl", "3xl", "4xl"],
		},
	},
};
