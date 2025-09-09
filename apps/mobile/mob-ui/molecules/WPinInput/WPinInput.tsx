import { useEffect, useState } from "react";
import { View } from "react-native";
import { WInput, WInputProps } from "@/mob-ui/atoms";
import { styles } from "./WPinInput.styles";

export interface WPinInputProps {
	length: number;
	value?: string;
	onChange: (value: string) => void;
	status?: WInputProps["status"];
	secureTextEntry?: WInputProps["secureTextEntry"];
}

export const WPinInput = ({
	length = 4,
	onChange,
	value,
	status = "default",
	secureTextEntry = true,
}: WPinInputProps) => {
	const [digitStatus, setDigitStatus] = useState<WInputProps["status"][]>(
		Array(length).fill(status),
	);
	const [focusedIndex, setFocusedIndex] = useState(0);
	const [val, setValue] = useState(value?.split("") ?? Array(length).fill(""));

	useEffect(() => {
		onChange(val.join(""));
	}, [val, onChange]);

	const handleTextChange = (text: string, index: number) => {
		if (text.length >= 1) {
			text.split("").forEach((char, i) => {
				if (i + index < length && char.match(/^[0-9]$/)) {
					setValue((prev) => {
						const newValue = [...prev];
						newValue[i + index] = char;
						return newValue;
					});
					setDigitStatus((prev) => {
						const newStatus = [...prev];
						newStatus[i + index] = "success";
						return newStatus;
					});
				}
			});
			const nextIndex = Math.min(index + text.length, length - 1);
			setFocusedIndex(nextIndex);
		}

		if (text.length === 0) {
			setValue((prev) => {
				const newValue = [...prev];
				newValue[index] = "";
				return newValue;
			});
			setDigitStatus((prev) => {
				const newStatus = [...prev];
				newStatus[index] = "default";
				return newStatus;
			});
			setFocusedIndex(Math.max(0, index - 1));
		}
	};

	return (
		<View style={{ flexDirection: "row", gap: 8 }}>
			{[...Array(length)].map((_, index) => (
				<WInput
					// biome-ignore lint/suspicious/noArrayIndexKey: there is no unique id here
					key={index}
					testID={`pin-input-${index}`}
					inputStyle={styles.input}
					inputRowStyle={styles.inputRow}
					keyboardType="numeric"
					value={val?.[index] ?? ""}
					focused={focusedIndex === index}
					onFocus={() => setFocusedIndex(index)}
					onBlur={() => setFocusedIndex(-1)}
					autoComplete="off"
					autoFocus={index === 0}
					onChangeText={(text) => handleTextChange(text, index)}
					textProps={{ size: "4xl", weight: "bold", mode: "primary" }}
					fullWidth={false}
					showClear={false}
					status={status === "default" ? digitStatus[index] : status}
					secureTextEntry={secureTextEntry}
					secureTextEntrySwitchable={false}
				/>
			))}
		</View>
	);
};
