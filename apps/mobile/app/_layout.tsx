import { Stack } from "expo-router";
// import { WAppHeader } from "@/mob-ui/atoms/WAppHeader/WAppHeader";

export default function RootLayout() {
	return (
		<Stack
		// screenOptions={{
		// 	header: (props) => <WAppHeader route={props.route.name} />,
		// }}
		>
			<Stack.Screen
				name="index"
				options={{ title: "Home", headerShown: false }}
			/>
			<Stack.Screen name="signin" options={{ title: "Sign In" }} />
			<Stack.Screen name="signup" options={{ title: "Sign Up" }} />
			<Stack.Screen name="verify" options={{ title: "" }} />
			<Stack.Screen name="catalog" options={{ title: "Vocabulary catalog" }} />
		</Stack>
	);
}
