import { type Meta, type StoryObj } from "@storybook/react-native";
import { View } from "react-native";
import { expect, fn } from "storybook/test";

import { WInput } from "./WInput";

const onChangeTextMock = fn();

const meta = {
	title: "Atoms/WInput",
	component: WInput,
	decorators: [
		(Story) => (
			<View style={{ flex: 1, alignItems: "flex-start" }}>
				<Story />
			</View>
		),
	],

	tags: ["autodocs"],
} satisfies Meta<typeof WInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
	args: {
		testID: "input-base",
		placeholder: "Placeholder",
		label: "Label",
		description: "Any kind of description or error message",
		showClear: true,
		secureTextEntry: true,
		value: "Input value",
		onChangeText: onChangeTextMock,
	},
	play: async ({ canvas, userEvent }) => {
		const input = await canvas.getByTestId("input-base");

		await userEvent.clear(input);
		await userEvent.type(input, "New value");

		expect(onChangeTextMock).toHaveBeenCalledTimes(10);
	},
};
