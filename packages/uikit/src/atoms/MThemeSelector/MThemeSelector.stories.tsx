import type { Meta, StoryObj } from "@storybook/react";

import MThemeSelector from "./MThemeSelector";

const meta: Meta<typeof MThemeSelector> = {
	title: "Atoms/Layout/MThemeSelector",
	component: MThemeSelector,
};

export default meta;
type Story = StoryObj<typeof MThemeSelector>;

export const Basic: Story = {
	args: {},

	argTypes: {},

	render: function Render(_args) {
		return <MThemeSelector />;
	},
};
