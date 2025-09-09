import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WButton, WInput, WText } from "@/mob-ui";
import { styles } from "../general.styles";

export default function SignIn() {
	const router = useRouter();

	return (
		<SafeAreaView mode="padding" style={styles.page}>
			<View style={styles.formWrapper}>
				<View style={styles.fieldsGroup}>
					<WText mode="primary" size="2xl">
						Your email
					</WText>
					<WInput placeholder="example@domain.com" />
				</View>
				<WButton mode="primary" onPress={() => router.push("/verify")}>
					<Text>Continue</Text>
				</WButton>
			</View>
		</SafeAreaView>
	);
}
