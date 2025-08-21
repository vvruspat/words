import type { Meta, StoryObj } from "@storybook/react";

import { MIconDiceOne } from "../MIcon/icons/MIconDiceOne";
import { MIconDiceThree } from "../MIcon/icons/MIconDiceThree";
import { MIconDiceTwo } from "../MIcon/icons/MIconDiceTwo";
import MGrid from "./MGrid";

const meta: Meta<typeof MGrid> = {
	title: "Atoms/Layout/MGrid",
	component: MGrid,
};

export default meta;
type Story = StoryObj<typeof MGrid>;

export const Basic: Story = {
	args: {
		tag: "div",
		rowGap: "s",
		columnGap: "s",
		alignItems: "center",
		justifyItems: "center",
		columnTemplate: "repeat(7, 1fr)",
		rowTemplate: "repeat(3, 1fr)",
		display: "inline-grid",
		children: (
			<>
				<MIconDiceOne mode="regular" width={24} />
				<MIconDiceTwo mode="regular" width={24} />
				<MIconDiceThree mode="regular" width={24} />
				<MIconDiceOne mode="regular" width={24} />
				<MIconDiceTwo mode="regular" width={24} />
				<MIconDiceThree mode="regular" width={24} />
				<MIconDiceOne mode="regular" width={24} />
				<MIconDiceTwo mode="regular" width={24} />
				<MIconDiceThree mode="regular" width={24} />
				<MIconDiceOne mode="regular" width={24} />
				<MIconDiceTwo mode="regular" width={24} />
				<MIconDiceThree mode="regular" width={24} />
			</>
		),
	},

	argTypes: {
		tag: {
			control: { type: "select" },
			options: ["div", "section", "article", "aside", "nav"],
			description: "HTML tag to use for the grid container",
			defaultValue: "div",
		},
		rowGap: {
			control: { type: "select" },
			options: ["xs", "s", "m", "l", "xl", "3xl", "4xl"],
		},
		columnGap: {
			control: { type: "select" },
			options: ["xs", "s", "m", "l", "xl", "3xl", "4xl"],
		},
		alignItems: {
			control: { type: "select" },
			options: ["start", "center", "end", "stretch"],
		},
		justifyItems: {
			control: { type: "select" },
			options: ["start", "center", "end", "space-between", "space-around"],
		},
		display: {
			control: { type: "select" },
			options: ["grid", "inline-grid"],
		},
	},
};
