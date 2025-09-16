import { StyleSheet } from "react-native";
import { Colors } from "@/mob-ui/brand/colors";

export const trainingAppWrapperStyles = StyleSheet.create({
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
	},
	title: {
		color: Colors.greys.white,
	},
	closeLink: {
		borderRadius: 16,
		overflow: "hidden",
	},
	closeIcon: {
		backgroundColor: Colors.greys.white,
	},
});
