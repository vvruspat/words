import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WButton } from "@/mob-ui";
import { styles } from "../general.styles";

export default function Index() {
	const router = useRouter();

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
				<WButton mode="primary" onTouchEnd={() => router.push("/signin")}>
					<Text>Sign in</Text>
				</WButton>
				<WButton mode="secondary" onTouchEnd={() => router.push("/signup")}>
					<Text>Sign up</Text>
				</WButton>
			</View>
		</SafeAreaView>
	);
}
