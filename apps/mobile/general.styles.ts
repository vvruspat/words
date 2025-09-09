import { StyleSheet } from "react-native";
import { Colors } from "@/mob-ui/brand/colors";

export const styles = StyleSheet.create({
	screen: {
		backgroundColor: Colors.dark.primaryBackground,
	},
	page: {
		flex: 1,
		justifyContent: "flex-start",
		paddingHorizontal: 16,
		alignItems: "flex-start",
		// backgroundColor: Colors.dark.primaryBackground,
	},

	formWrapper: {
		gap: 32,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
	},

	fieldsGroup: {
		gap: 16,
		width: "100%",
	},
});
