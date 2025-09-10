import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Tabs } from "expo-router";
import { Colors } from "@/mob-ui/brand/colors";

export default function RootLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarItemStyle: { paddingTop: 8 },
				tabBarActiveTintColor: Colors.primary.base,
				tabBarInactiveTintColor: Colors.greys.grey8,
				tabBarStyle: {
					backgroundColor: Colors.dark.primaryBackground,
					borderTopColor: Colors.greys.whiteAlpha60,
				},
				sceneStyle: { backgroundColor: "transparent" },
			}}
		>
			<Tabs.Screen
				name="learning"
				options={{
					title: "Learning",
					headerShown: false,
					tabBarIcon: ({ color }) => (
						<FontAwesome5 name="chalkboard-teacher" size={24} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="catalog"
				options={{
					title: "Vocabulary catalog",
					headerShown: false,
					tabBarIcon: ({ color }) => (
						<FontAwesome5 name="book" size={24} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					headerShown: false,
					tabBarIcon: ({ color }) => (
						<FontAwesome5 name="cog" size={24} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
