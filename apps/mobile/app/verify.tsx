import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WButton, WText } from "@/mob-ui";
import { WPinInput } from "@/mob-ui/molecules/WPinInput";
import { styles } from "./general.styles";

export default function Verify() {
	const router = useRouter();

	return (
		<SafeAreaView mode="padding" style={styles.page}>
			<View style={styles.formWrapper}>
				<WText mode="primary" size="2xl">
					Enter the code we sent
				</WText>
				<WText mode="primary" size="2xl">
					to your email
				</WText>

				<WPinInput length={4} secureTextEntry={false} onChange={() => {}} />
				<WButton mode="primary" onPress={() => router.push("/catalog")}>
					<Text>Verify</Text>
				</WButton>
			</View>
		</SafeAreaView>
	);
}
