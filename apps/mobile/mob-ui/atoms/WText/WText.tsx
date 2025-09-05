import { StyleSheet, Text, TextProps } from "react-native";
import { typography } from "@/mob-ui/brand/typography";
import { styles } from "./WText.styles";

type WTextProps = TextProps & {
	size?: keyof typeof typography.fontSize;
	mode?: "primary" | "secondary" | "tertiary";
	weight?: "bold" | "semibold" | "medium" | "regular" | "light" | "thin";
};

export const WText = ({
	children,
	size = "md",
	mode = "primary",
	weight = "regular",
	style,
	...rest
}: WTextProps) => {
	return (
		<Text
			{...rest}
			style={StyleSheet.compose(
				[
					styles.text,
					styles[`${mode}`],
					styles[`${weight}`],
					{ fontSize: typography.fontSize[size] },
				],
				style,
			)}
		>
			{children}
		</Text>
	);
};
