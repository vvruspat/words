import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WButton, WInput } from "@/mob-ui";
import { styles } from "../general.styles";

export default function SignUp() {
	const router = useRouter();

	return (
		<SafeAreaView mode="padding" style={styles.page}>
			<View style={styles.formWrapper}>
				<View style={styles.fieldsGroup}>
					<WInput placeholder="Your name" label="Name" />
					<WInput placeholder="example@domain.com" label="E-Mail" />
				</View>
				<WButton
					mode="primary"
					fullWidth
					onPress={() => router.push("/verify")}
				>
					<Text>Continue</Text>
				</WButton>
			</View>
		</SafeAreaView>
	);
}
