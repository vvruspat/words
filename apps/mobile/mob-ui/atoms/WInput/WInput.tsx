import React, {
	forwardRef,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import {
	Animated,
	Easing,
	NativeSyntheticEvent,
	TextInput,
	TextInputFocusEventData,
	TextInputProps,
	TextStyle,
	TouchableOpacity,
	View,
	ViewStyle,
} from "react-native";
import { WText } from "../WText";
import { ClearIcon } from "./icons/ClearIcon";
import { EyeCloseIcon } from "./icons/EyeCloseIcon";
import { EyeOpenIcon } from "./icons/EyeOpenIcon";
import { styles } from "./WInput.styles";

interface WInputProps extends TextInputProps {
	label?: string;
	status?: "default" | "error" | "success";
	description?: string;
	containerStyle?: ViewStyle;
	inputStyle?: TextStyle;
	before?: React.ReactNode;
	after?: React.ReactNode;
	showClear?: boolean;
}

export const WInput = forwardRef<TextInput, WInputProps>((props, ref) => {
	const {
		label,
		status = "default",
		containerStyle,
		inputStyle,
		before,
		after,
		showClear = true,
		secureTextEntry,
		description,
		value,
		onChangeText,
		...rest
	} = props;

	const internalRef = useRef<TextInput | null>(null);
	useImperativeHandle(ref, () => internalRef.current as TextInput);

	const [isSecure, setIsSecure] = useState<boolean>(!!secureTextEntry);

	const anim = useRef(new Animated.Value(0)).current; // 0 = unfocused, 1 = focused

	const shadowOpacity = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 1],
	});

	const shadowRadius = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 4],
	});

	const elevation = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 4],
	});

	const handleClear = () => {
		onChangeText?.("");
		internalRef.current?.focus();
	};

	const handleInputFocus = (
		e: NativeSyntheticEvent<TextInputFocusEventData>,
	) => {
		Animated.timing(anim, {
			toValue: 1,
			duration: 200,
			easing: Easing.inOut(Easing.ease),
			// borderColor + shadow need useNativeDriver to be false
			useNativeDriver: false,
		}).start();
		rest.onFocus?.(e);
	};

	const handleInputBlur = (
		e: NativeSyntheticEvent<TextInputFocusEventData>,
	) => {
		Animated.timing(anim, {
			toValue: 0,
			duration: 200,
			easing: Easing.inOut(Easing.ease),
			// borderColor + shadow need useNativeDriver to be false
			useNativeDriver: false,
		}).start();
		rest.onBlur?.(e);
	};

	const styleMode = (status.charAt(0).toUpperCase() + status.slice(1)) as
		| "Default"
		| "Error"
		| "Success";

	return (
		<View style={[styles.wrapper, containerStyle]}>
			{label ? (
				<WText mode="primary" size="sm" style={styles.label}>
					{label}
				</WText>
			) : null}
			<Animated.View
				style={[
					styles.inputRow,
					styles[`inputRow${styleMode}`],
					{
						shadowOpacity,
						shadowRadius,
						elevation,
					},
				]}
			>
				{before ? <View style={styles.left}>{before}</View> : null}

				<TextInput
					ref={internalRef}
					style={[styles.input, inputStyle]}
					placeholderTextColor={styles.inputRowPlaceholder.color}
					secureTextEntry={isSecure}
					value={value}
					onChangeText={onChangeText}
					onFocus={handleInputFocus}
					onBlur={handleInputBlur}
					underlineColorAndroid="transparent"
					{...rest}
				/>

				{showClear && value && (
					<TouchableOpacity
						onPress={handleClear}
						style={styles.actionButton}
						accessibilityLabel="Clear input"
					>
						<ClearIcon fill={styles.inputRow.color} />
					</TouchableOpacity>
				)}

				{secureTextEntry && (
					<TouchableOpacity
						onPress={() => setIsSecure((s) => !s)}
						style={styles.actionButton}
						accessibilityLabel={isSecure ? "Show password" : "Hide password"}
					>
						{isSecure ? (
							<EyeOpenIcon fill={styles.inputRow.color} />
						) : (
							<EyeCloseIcon fill={styles.inputRow.color} />
						)}
					</TouchableOpacity>
				)}

				{after ? <View style={styles.right}>{after}</View> : null}
			</Animated.View>
			{description ? (
				<WText
					size="xs"
					mode="tertiary"
					style={[styles.description, styles[`description${styleMode}`]]}
				>
					{description}
				</WText>
			) : null}
		</View>
	);
});

export default WInput;
