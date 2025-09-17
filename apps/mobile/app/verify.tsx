import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WCharInput, WText } from "@/mob-ui";
import { styles } from "../general.styles";

const PIN_LENGTH = 4;

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

				<WCharInput
					length={PIN_LENGTH}
					secureTextEntry={false}
					keyboardType="visible-password"
					onChangeText={(text) => {
						if (text.length === PIN_LENGTH) {
							router.push("/authorized/learning");
						}
					}}
				/>
			</View>
		</SafeAreaView>
	);
}
