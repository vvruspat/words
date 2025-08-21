import type { Meta, StoryObj } from "@storybook/react";

import MButton from "../MButton/MButton";
import MFlex from "../MFlex/MFlex";
import MText from "../MText/MText";
import MCard from "./MCard";

const meta: Meta<typeof MCard> = {
	title: "Atoms/Layout/MCard",
	component: MCard,
};

export default meta;
type Story = StoryObj<typeof MCard>;

export const Basic: Story = {
	args: {
		children: <MText>Card content</MText>,
		header: "Title",
		showHeaderDivider: false,
		showFooterDivider: true,
		shadow: true,
		noPadding: false,
		collapsed: false,
		footer: (
			<MFlex justify="space-between">
				<MText>Footer content</MText>
				<MFlex gap="xl" justify="end">
					<MButton mode="primary">Primary</MButton>
					<MButton mode="secondary">Secondary</MButton>
				</MFlex>
			</MFlex>
		),
		borderLeftBottomRadius: "l",
		borderLeftTopRadius: "l",
		borderRightBottomRadius: "l",
		borderRightTopRadius: "l",
	},

	argTypes: {
		children: {
			control: { type: "text" },
		},
		header: {
			control: { type: "text" },
		},
		footer: {
			control: { type: "text" },
		},
		collapsed: { control: { type: "boolean" } },
		shadow: { control: { type: "boolean" } },
		noPadding: { control: { type: "boolean" } },
		showHeaderDivider: { control: { type: "boolean" } },
		showFooterDivider: { control: { type: "boolean" } },
		borderLeftBottomRadius: {
			control: { type: "select" },
			options: ["none", "s", "m", "l", "xl", "2xl", "3xl", "4xl"],
		},
		borderLeftTopRadius: {
			control: { type: "select" },
			options: ["none", "s", "m", "l", "xl", "2xl", "3xl", "4xl"],
		},
		borderRightBottomRadius: {
			control: { type: "select" },
			options: ["none", "s", "m", "l", "xl", "2xl", "3xl", "4xl"],
		},
		borderRightTopRadius: {
			control: { type: "select" },
			options: ["none", "s", "m", "l", "xl", "2xl", "3xl", "4xl"],
		},
	},
};
