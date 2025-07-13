import type { Meta, StoryObj } from "@storybook/react";
import { MIconBracketsSquare } from "../MIcon/icons/MIconBracketsSquare";
import MTabs from "./MTabs";

const meta: Meta<typeof MTabs> = {
	title: "Atoms/Form/MTabs",
	component: MTabs,
};

export default meta;
type Story = StoryObj<typeof MTabs>;
const icon = () => <MIconBracketsSquare mode="regular" width={20} />;
export const Basic: Story = {
	args: {
		items: [
			{
				key: "1",
				label: "Tab 1",
				content: "Content of Tab Pane 1",
				disabled: false,
			},
			{
				key: "2",
				label: "Tab 2",
				content: "Content of Tab Pane 2",
				disabled: true,
				before: icon(),
			},
			{
				key: "3",
				label: "Tab 3",
				content: "Content of Tab Pane 3",
				disabled: false,
				before: icon(),
			},
		],
	},

	argTypes: {
		items: {
			control: {
				type: "object",
			},
		},
	},
};
