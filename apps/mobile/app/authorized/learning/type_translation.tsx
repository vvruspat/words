import { SafeAreaView } from "react-native-safe-area-context";
import { WText } from "@/mob-ui";
import { styles } from "../../../general.styles";

export default function TypeTranslation() {
	return (
		<SafeAreaView mode="padding" style={styles.page}>
			<WText mode="primary" size="2xl">
				Type translation
			</WText>
		</SafeAreaView>
	);
}
