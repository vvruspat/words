import { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GlowingEllipse } from "@/components/GlowingEllipse";
import { PlayWordButton } from "@/components/PlayWordButton";
import { TrainingAppWrapper } from "@/components/TrainingAppWrapper";
import { BackgroundContext } from "@/context/BackgroundContext";
import { WButton, WCard, WText, WZStack } from "@/mob-ui";
import { Colors } from "@/mob-ui/brand/colors";

export default function ChooseTranslation() {
	const { setColor, setOpacity } = useContext(BackgroundContext);

	useEffect(() => {
		setColor(Colors.backgrounds.cian);
		setOpacity(1);

		return () => {
			setOpacity(0.3);
		};
	}, [setColor, setOpacity]);

	return (
		<TrainingAppWrapper title="Choose the correct translation">
			<WCard style={styles.container}>
				<WZStack style={{ overflow: "hidden" }}>
					<GlowingEllipse />
					<View style={[StyleSheet.absoluteFill, styles.translationContainer]}>
						<View style={styles.wordContainer}>
							<WText mode="primary" weight="bold" size="3xl">
								Word
							</WText>
							<WText mode="secondary" size="xl">
								[transliteration]
							</WText>
						</View>
						<View style={styles.wordTranslationContainer}>
							<PlayWordButton />
						</View>
					</View>
				</WZStack>
			</WCard>

			<View style={styles.buttonsContainer}>
				<WButton mode="dark" fullWidth>
					<WText>Love</WText>
				</WButton>
				<WButton mode="dark" fullWidth>
					<WText>World</WText>
				</WButton>
				<WButton mode="dark" fullWidth>
					<WText>Death</WText>
				</WButton>
				<WButton mode="dark" fullWidth>
					<WText>Robots</WText>
				</WButton>
			</View>
		</TrainingAppWrapper>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		padding: 0,
		marginVertical: 32,
		backgroundColor: Colors.backgrounds.primaryBackground,
		flex: 1,
	},
	translationContainer: {
		padding: 24,
		justifyContent: "center",
		alignItems: "center",
		gap: 16,
	},
	wordContainer: {
		justifyContent: "center",
		alignItems: "center",
		gap: 16,
	},
	wordTranslationContainer: {
		justifyContent: "center",
		alignItems: "center",
		gap: 64,
	},
	buttonsContainer: {
		width: "100%",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		alignContent: "stretch",
		gap: 16,
	},
});
