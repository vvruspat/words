import React, {
	forwardRef,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import {
	Text,
	TextInput,
	TextInputProps,
	TextStyle,
	TouchableOpacity,
	View,
	ViewStyle,
} from "react-native";
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
	const [isFocused, setIsFocused] = useState<boolean>(false);

	const handleClear = () => {
		onChangeText?.("");
		internalRef.current?.focus();
	};

	const styleMode = (status.charAt(0).toUpperCase() + status.slice(1)) as
		| "Default"
		| "Error"
		| "Success";

	return (
		<View style={[styles.wrapper, containerStyle]}>
			{label ? <Text style={styles.label}>{label}</Text> : null}
			<View
				style={[
					styles.inputRow,
					styles[`inputRow${styleMode}`],
					isFocused && styles[`inputRow${styleMode}Focused`],
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
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
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
			</View>
			{description ? (
				<Text style={[styles.description, styles[`description${styleMode}`]]}>
					{description}
				</Text>
			) : null}
		</View>
	);
});

export default WInput;
