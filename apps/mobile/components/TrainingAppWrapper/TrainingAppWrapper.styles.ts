import { StyleSheet } from "react-native";
import { Colors } from "@/mob-ui/brand/colors";

export const trainingAppWrapperStyles = StyleSheet.create({
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
		maxWidth: "100%",
	},
	title: {
		flex: 1,
		color: Colors.greys.white,
		overflow: "hidden",
	},
	closeLink: {
		flex: 0,
		borderRadius: 16,
		overflow: "hidden",
	},
	closeIcon: {
		backgroundColor: Colors.greys.white,
	},
});
