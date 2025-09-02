import { type Meta, type StoryObj } from "@storybook/react-native";

import { Text, View } from "react-native";
import { fn } from "storybook/test";

import { WButton } from "./WButton";

const meta = {
	component: WButton,
	decorators: [
		(Story) => (
			<View style={{ flex: 1, alignItems: "flex-start" }}>
				<Story />
			</View>
		),
	],
	tags: ["autodocs"],
	args: { onPress: fn() },
} satisfies Meta<typeof WButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {
		mode: "primary",
		children: <Text>Primary Button</Text>,
	},
};

export const Secondary: Story = {
	args: {
		mode: "secondary",
		children: <Text>Secondary Button</Text>,
	},
};

export const Tertiary: Story = {
	args: {
		mode: "tertiary",
		children: <Text>Tertiary Button</Text>,
	},
};

export const Red: Story = {
	args: {
		mode: "red",
		children: <Text>Red Button</Text>,
	},
};

export const Green: Story = {
	args: {
		mode: "green",
		children: <Text>Green Button</Text>,
	},
};

export const Purple: Story = {
	args: {
		mode: "purple",
		children: <Text>Purple Button</Text>,
	},
};

export const Dark: Story = {
	args: {
		mode: "dark",
		children: <Text>Dark Button</Text>,
	},
};
