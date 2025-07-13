import type { Meta, StoryObj } from "@storybook/react";
import { MIconCaretDown } from "../../atoms/MIcon/icons/MIconCaretDown";
import { MIconCaretRight } from "../../atoms/MIcon/icons/MIconCaretRight";
import MAccordion from "./MAccordion";

const meta: Meta<typeof MAccordion> = {
	title: "Molecules/Data Display/Accordion",
	component: MAccordion,
};

export default meta;
type Story = StoryObj<typeof MAccordion>;

const iconClosed = <MIconCaretRight mode="regular" width={20} />;
const iconOpen = <MIconCaretDown mode="regular" width={20} />;

export const Basic: Story = {
	args: {
		items: [
			{
				key: 1,
				title: "item 1",
				children: "accordion item 1",
			},
			{
				key: 2,
				title: "title 2",
				children: "accordion item 2",
			},
			{
				key: 3,
				title: "title 3",
				children: "accordion item 3",
			},
			{
				key: 4,
				title: "title 4",
				children: "accordion item 4",
			},
			{
				key: 5,
				title: "title 5",
				children: "accordion item 5",
			},
		],
		iconClosed,
		iconOpen,
	},

	argTypes: {
		iconClosed: { type: "string" },
		iconOpen: { type: "string" },
	},
};
