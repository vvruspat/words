import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScreenBackground } from "@/components/ScreenBackground";
import { BackgroundProvider } from "@/context/BackgroundContext";
import { styles } from "@/general.styles";
import { WZStack } from "@/mob-ui";
import "../i18n";
import { useTranslation } from "react-i18next";

export default function RootLayout() {
	const { t } = useTranslation();

	return (
		<Stack
			screenLayout={({ children }) => (
				<BackgroundProvider>
					<WZStack>
						<StatusBar style="light" />
						<ScreenBackground />
						{children}
					</WZStack>
				</BackgroundProvider>
			)}
			screenOptions={{
				headerShown: false,
				contentStyle: styles.screen,
			}}
		>
			<Stack.Screen
				name="index"
				options={{ title: t("home"), headerShown: false }}
			/>
			<Stack.Screen name="signin" options={{ title: t("sign_in") }} />
			<Stack.Screen name="signup" options={{ title: t("sign_up") }} />
			<Stack.Screen name="verify" options={{ title: "" }} />
			<Stack.Screen name="authorized" options={{ headerShown: false }} />
		</Stack>
	);
}
