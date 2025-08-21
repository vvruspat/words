import type { Meta, StoryObj } from "@storybook/react";

import { MIconCheck } from "../MIcon/icons/MIconCheck";
import MSwitch from "./MSwitch";

const meta: Meta<typeof MSwitch> = {
	title: "Atoms/Form/MSwitch",
	component: MSwitch,
};

export default meta;

const leftIconContent = () => <MIconCheck mode="bold" width={10} />;

const argTypes = {
	borderType: {
		control: { type: "select" },
		options: ["round", "rectangular"],
	},
	disabled: {
		control: { type: "boolean" },
	},
	leftIcon: {
		control: { type: "text" },
	},
	rightIcon: {
		control: { type: "text" },
	},
};

type Story = StoryObj<typeof MSwitch>;

export const Regular: Story = {
	args: {
		disabled: false,
		leftIcon: leftIconContent(),
	},

	argTypes,
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},

	argTypes,
};
