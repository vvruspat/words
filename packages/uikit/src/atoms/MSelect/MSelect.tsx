"use client";

import clsx from "clsx";
import {
	type ChangeEvent,
	type ReactNode,
	useCallback,
	useMemo,
	useState,
} from "react";
import ReactDOMServer from "react-dom/server";
import type { BasicInputProps } from "../../types/BasicInputProps";
import MDropdown from "../MDropdown/MDropdown";
import { MIconCaretDown } from "../MIcon/icons/MIconCaretDown";
import { MInput } from "../MInput";
import MList, { type SelectOption } from "../MList/MList";
import type { ListItemProps } from "../MListItem/MListItem";
import styles from "./MSelect.module.css";

export type MSelectOption = ListItemProps & SelectOption;

type SelectComponentProps = BasicInputProps & {
	options: MSelectOption[];
	label?: ReactNode;
	description?: ReactNode;
	justify?: "start" | "center" | "end" | "space-between";
};

const extractTextFromReactNode = (reactNode: ReactNode) => {
	// Convert the ReactNode to static markup (HTML string)
	const markup = ReactDOMServer.renderToStaticMarkup(reactNode);

	// parse the HTML string
	const doc = new DOMParser().parseFromString(markup, "text/html");

	// get the text from the parsed document
	return doc.body.textContent || "";
};

export const MSelect = ({
	options,
	justify,
	defaultValue,
	value,
	name,
	...inputProps
}: SelectComponentProps) => {
	const [open, setOpen] = useState(false);
	const getInitialVisibleValue = (): string => {
		if (value) {
			const option = options.find((opt) => opt.key === defaultValue);
			return extractTextFromReactNode(option?.value ?? "");
		}
		if (defaultValue) {
			const option = options.find((opt) => opt.key === defaultValue);
			return extractTextFromReactNode(option?.value ?? "");
		}
		return "";
	};

	const [visibleValue, setVisibleValue] = useState<string>(
		getInitialVisibleValue(),
	);
	const [hiddenValue, setHiddenlValue] = useState(value || defaultValue || "");

	const handleClick = () => {
		setOpen(!open);
	};

	const onChoose = useCallback(
		(option: MSelectOption) => {
			if (inputProps.onChange) {
				const inputEvent = {
					target: {
						name: name || "",
						value: option.key,
					},
				} as ChangeEvent<HTMLInputElement>;

				inputProps.onChange(inputEvent);
			}

			setOpen(false);

			setHiddenlValue(option.key);
			setVisibleValue(extractTextFromReactNode(option.value) ?? "");
		},
		[name, inputProps.onChange],
	);

	const mappedOptions = useMemo(
		() => options.map((option) => ({ ...option, role: "option" })),
		[options],
	);

	const onVisibleInputChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			// React on change event only if it is data clearing
			if (event.target.value === "") {
				setVisibleValue("");
				setHiddenlValue("");
			}
		},
		[],
	);

	return (
		<MDropdown
			open={open}
			align={"right"}
			stretch
			noPadding
			dropdownContent={
				<MList showDivider options={mappedOptions} onChoose={onChoose} />
			}
		>
			<input type="hidden" name={name} value={hiddenValue} />
			<MInput
				readOnly
				className={clsx(styles.selectButton)}
				onClick={handleClick}
				value={visibleValue}
				after={<MIconCaretDown mode="regular" width={20} />}
				{...inputProps}
				onChange={onVisibleInputChange}
			/>
		</MDropdown>
	);
};

export default MSelect;
