import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScreenBackground } from "@/components/ScreenBackground";
import { BackgroundProvider } from "@/context/BackgroundContext";
import { styles } from "@/general.styles";
import { WZStack } from "@/mob-ui";

export default function RootLayout() {
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
				options={{ title: "Home", headerShown: false }}
			/>
			<Stack.Screen name="signin" options={{ title: "Sign In" }} />
			<Stack.Screen name="signup" options={{ title: "Sign Up" }} />
			<Stack.Screen name="verify" options={{ title: "" }} />
			<Stack.Screen name="authorized" options={{ headerShown: false }} />
		</Stack>
	);
}
