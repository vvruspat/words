import AntDesign from "@expo/vector-icons/AntDesign";
import { Link } from "expo-router";
import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/general.styles";
import { WText } from "@/mob-ui";
import { Colors } from "@/mob-ui/brand/colors";
import { trainingAppWrapperStyles } from "./TrainingAppWrapper.styles";

export const TrainingAppWrapper = ({
	title,
	children,
}: {
	children: ReactNode;
	title: string;
}) => {
	return (
		<SafeAreaView mode="padding" style={styles.page}>
			<View style={trainingAppWrapperStyles.headerRow}>
				<WText mode="primary" size="2xl" style={trainingAppWrapperStyles.title}>
					{title}
				</WText>
				<Link
					href="/authorized/learning"
					style={trainingAppWrapperStyles.closeLink}
				>
					<AntDesign
						name="closecircle"
						size={32}
						color={Colors.dark.black}
						style={trainingAppWrapperStyles.closeIcon}
					/>
				</Link>
			</View>
			{children}
		</SafeAreaView>
	);
};

export default TrainingAppWrapper;
