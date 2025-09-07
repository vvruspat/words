import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WText } from "@/mob-ui";
import { styles } from "./general.styles";

export default function Catalog() {
	return (
		<SafeAreaView mode="padding" style={styles.page}>
			<View
				style={{
					gap: 16,
					width: "100%",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<WText mode="primary" size="2xl">
					Catalog
				</WText>
			</View>
		</SafeAreaView>
	);
}
