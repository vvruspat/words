import { StyleSheet } from "react-native";
import { Colors } from "@/mob-ui/brand/colors";

export const styles = StyleSheet.create({
	page: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 16,
		alignItems: "center",
		backgroundColor: Colors.dark.darkBackground,
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
