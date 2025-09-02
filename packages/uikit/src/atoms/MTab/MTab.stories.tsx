import type { Meta, StoryObj } from "@storybook/react-vite";

import { MIconBracketsSquare } from "../MIcon/icons/MIconBracketsSquare";
import MTab from "./MTab";

const meta: Meta<typeof MTab> = {
	title: "Atoms/Form/MTab",
	component: MTab,
};

export default meta;
type Story = StoryObj<typeof MTab>;
const icon = () => <MIconBracketsSquare mode="regular" width={20} />;
export const Basic: Story = {
	args: {
		label: "example tab",
		disabled: false,
		before: icon(),
		after: icon(),
	},
	argTypes: {
		disabled: { control: { type: "boolean" } },
		before: {
			control: { type: "text" },
		},
		after: {
			control: { type: "text" },
		},
	},
};
