import { StyleSheet } from "react-native";
import { Colors } from "@/mob-ui/brand/colors";
import { typography } from "@/mob-ui/brand/typography";

export const styles = StyleSheet.create({
	wrapper: {
		width: "100%",
		marginVertical: 6,
	},
	label: {
		marginBottom: 6,
		color: Colors.greys.grey5,
		fontSize: typography.fontSize.sm,
	},
	inputRow: {
		color: Colors.greys.grey3,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.transparent,
		borderColor: Colors.greys.grey8,
		borderWidth: 1,
		borderRadius: 16,
		padding: 18,
		transitionProperty: "box-shadow, border-color",
		transitionDuration: "0.2s",
		transitionTimingFunction: "ease-in-out",
	},

	inputRowDefaultFocused: {
		boxShadow: `0 0 8px 0  ${Colors.greys.grey3}`,
	},
	inputRowErrorFocused: {
		boxShadow: `0 0 8px 0  ${Colors.accents.red}`,
	},
	inputRowSuccessFocused: {
		boxShadow: `0 0 8px 0  ${Colors.primary.base}`,
	},

	inputRowPlaceholder: {
		color: Colors.greys.whiteAlpha60,
	},

	inputRowDefault: {
		borderColor: Colors.greys.grey3,
	},
	inputRowError: {
		borderColor: Colors.accents.red,
	},
	inputRowSuccess: {
		borderColor: Colors.primary.base,
	},

	left: {
		marginRight: 8,
	},
	right: {
		marginLeft: 8,
	},
	input: {
		flex: 1,
		fontSize: typography.fontSize.md,
		lineHeight: typography.lineHeight.md,
		color: Colors.greys.grey3,
		padding: 0,
		outlineWidth: 0,
	},
	actionButton: {
		paddingHorizontal: 8,
		paddingVertical: 0,
		justifyContent: "center",
		alignItems: "center",
	},
	description: {
		fontSize: typography.fontSize.xs,
	},
	descriptionDefault: {
		marginTop: 6,
		color: Colors.greys.grey5,
	},
	descriptionError: {
		marginTop: 6,
		color: Colors.accents.red,
	},
	descriptionSuccess: {
		marginTop: 6,
		color: Colors.primary.base,
	},
});
