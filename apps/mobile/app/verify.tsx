import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WCharInput, WText } from "@/mob-ui";
import { styles } from "../general.styles";

const PIN_LENGTH = 4;

export default function Verify() {
	const router = useRouter();

	const { t } = useTranslation();

	return (
		<SafeAreaView mode="padding" style={styles.page}>
			<View style={styles.formWrapper}>
				<WText mode="primary" size="2xl" align="center">
					{t("verify_enter_code")}
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
