import { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GlowingEllipse } from "@/components/GlowingElipse";
import { PlayWordButton } from "@/components/PlayWordButton";
import { TrainingAppWrapper } from "@/components/TrainingAppWrapper";
import { BackgroundContext } from "@/context/BackgroundContext";
import { WButton, WCard, WText, WZStack } from "@/mob-ui";
import { Colors } from "@/mob-ui/brand/colors";

export default function TrueOrFalse() {
	const { setColor, setOpacity } = useContext(BackgroundContext);

	useEffect(() => {
		setColor(Colors.backgrounds.purple);
		setOpacity(1);

		return () => {
			setOpacity(0.3);
		};
	}, [setColor, setOpacity]);

	return (
		<TrainingAppWrapper title="Is it right or wrong?">
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
							<WText mode="primary" size="xl">
								translation
							</WText>

							<PlayWordButton />
						</View>
					</View>
				</WZStack>
			</WCard>

			<View style={styles.buttonsContainer}>
				<WButton mode="dark" stretch>
					<WText>Yes</WText>
				</WButton>
				<WButton mode="dark" stretch>
					<WText>No</WText>
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
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		alignContent: "stretch",
		gap: 24,
	},
});
