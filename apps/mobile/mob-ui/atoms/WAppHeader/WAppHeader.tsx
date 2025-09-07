import { SafeAreaView, View } from "react-native";
import { Colors } from "@/mob-ui/brand/colors";
import { WText } from "../WText";

export const WAppHeader = ({ route }: { route: string }) => {
	return (
		<SafeAreaView
			style={{
				backgroundColor: Colors.dark.darkBackground,
				justifyContent: "center",
				alignItems: "center",
				borderBottomWidth: 1,
				borderBottomColor: Colors.greys.grey8,
			}}
		>
			<View
				style={{
					height: 64,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<WText size="lg" weight="bold" mode="primary">
					{route}
				</WText>
			</View>
		</SafeAreaView>
	);
};
