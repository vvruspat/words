import { Defs, G, RadialGradient, Rect, Stop, Svg } from "react-native-svg";
import { Colors } from "@/mob-ui/brand/colors";

export const ScreenBackground = () => {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 393 852" fill="none">
			<G opacity="0.3">
				<Rect width="393" height="852" fill={Colors.dark.primaryBackground} />
				<Rect
					width="393"
					height="852"
					fill="url(#paint0_radial_388_4862)"
					fillOpacity="0.5"
				/>
			</G>
			<Defs>
				<RadialGradient
					id="paint0_radial_388_4862"
					cx="0"
					cy="0"
					r="1"
					gradientTransform="matrix(-457.5 1019.17 -503.55 -1058.85 381 6.77014)"
					gradientUnits="userSpaceOnUse"
				>
					<Stop stopColor={Colors.primary.base} />
					<Stop offset="1" stopOpacity="0" />
				</RadialGradient>
			</Defs>
		</Svg>
	);
};
