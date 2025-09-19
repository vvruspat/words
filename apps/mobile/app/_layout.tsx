import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScreenBackground } from "@/components/ScreenBackground";
import { BackgroundProvider } from "@/context/BackgroundContext";
import { styles } from "@/general.styles";
import { WZStack } from "@/mob-ui";
import "../i18n";

import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { DatabaseProvider } from "@nozbe/watermelondb/DatabaseProvider";
import { useTranslation } from "react-i18next";
import Category from "@/models/Category";
import LearningProgress from "@/models/LearningProgress";
import migrations from "@/models/migrations";
import { schema } from "@/models/schema";
import Translation from "@/models/Translation";
import User from "@/models/User";
import UserSetting from "@/models/UserSetting";
import Word from "@/models/Word";

const adapter = new SQLiteAdapter({
	schema,
	migrations,
	jsi: true /* Platform.OS === 'ios' */,
	dbName: "wordsapp",
	// (optional, but you should implement this method)
	onSetUpError: (_error) => {
		// Database failed to load -- offer the user to reload the app or log out
	},
});

// Then, make a Watermelon database from it!
const database = new Database({
	adapter,
	modelClasses: [
		User,
		UserSetting,
		Word,
		Translation,
		LearningProgress,
		Category,
	],
});

export default function RootLayout() {
	const { t } = useTranslation();

	return (
		<DatabaseProvider database={database}>
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
		</DatabaseProvider>
	);
}
