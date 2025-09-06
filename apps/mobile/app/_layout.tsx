import { Stack } from "expo-router";
import { WAppHeader } from "@/mob-ui/atoms/WAppHeader/WAppHeader";

export default function RootLayout() {
	return <Stack screenOptions={{ header: () => <WAppHeader /> }} />;
}
