import { SafeAreaView } from "react-native-safe-area-context";
import { WButton, WInput, WText } from "@/mob-ui";
import { Colors } from "@/mob-ui/brand/colors";

export default function Index() {
	return (
		<SafeAreaView
			mode="padding"
			style={{
				flex: 1,
				justifyContent: "center",
				paddingHorizontal: 16,
				alignItems: "center",
				backgroundColor: Colors.dark.darkBackground,
			}}
		>
			<WText mode="primary">Edit app/index.tsx to edit this screen.</WText>
			<WInput
				placeholder="Input"
				label="Input Label"
				description="Input description"
			/>
			<WInput
				placeholder="Input 2"
				label="Input Label"
				status="success"
				description="Input description"
			/>
			<WButton mode="primary" onPress={() => alert("Pressed!")}>
				<WText style={{ color: "white" }}>Press me</WText>
			</WButton>
		</SafeAreaView>
	);
}
