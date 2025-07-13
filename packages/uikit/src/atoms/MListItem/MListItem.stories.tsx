import type { Meta, StoryObj } from "@storybook/react";
import MFlex from "../MFlex/MFlex";
import { MIconBracketsSquare } from "../MIcon/icons/MIconBracketsSquare";
import MText from "../MText/MText";
import MListItem from "./MListItem";

const meta: Meta<typeof MListItem> = {
	title: "Atoms/Form/MListItem",
	component: MListItem,
};

export default meta;
type Story = StoryObj<typeof MListItem>;
const item = () => (
	<MFlex gap="s">
		<MIconBracketsSquare mode="regular" width={20} />
		<MText>List Item</MText>
	</MFlex>
);
export const Basic: Story = {
	args: {
		children: item(),
	},

	argTypes: {
		children: {
			control: { type: "text" },
		},
	},
};
