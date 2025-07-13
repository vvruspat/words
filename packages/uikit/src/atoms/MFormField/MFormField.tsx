import clsx from "clsx";
import type { ReactElement, ReactNode } from "react";
import React, { type ComponentProps, useId, useMemo } from "react";
import type { BasicInputProps } from "../../types/BasicInputProps";
import type { TComponentSize } from "../../types/TComponentSize";
import type { TComponentStatus } from "../../types/TComponentStatus";
import { MFieldDescription } from "../MFieldDescription";
import { MLabel } from "../MLabel";
import { MRequired } from "../MRequired";
import styles from "./MFormField.module.css";

type MFormFieldProp = ComponentProps<"input"> &
	Partial<TComponentStatus> & {
		id?: string;
		required?: boolean;
		spacing?: Extract<TComponentSize["size"], "s" | "m" | "l"> | "auto";
		label: ReactElement<ComponentProps<typeof MLabel>> | string;
		description?: ReactNode | string;
		control: ReactElement<BasicInputProps>;
		direction?: "row" | "column";
	};

export const MFormField = ({
	id,
	required = false,
	direction = "row",
	spacing = "s",
	label,
	description,
	control,
	status,
	...inputProps
}: MFormFieldProp) => {
	const uuid = useId();
	const fieldId = useMemo(() => id ?? uuid, [uuid, id]);

	const requiredComponent = useMemo(
		() => (required ? <MRequired /> : null),
		[required],
	);

	const labelComponent = useMemo(() => {
		return typeof label === "string" ? (
			<MLabel htmlFor={fieldId} after={requiredComponent} status={status}>
				{label}
			</MLabel>
		) : (
			React.cloneElement(label, {
				htmlFor: fieldId,
				after: requiredComponent,
				status,
			})
		);
	}, [label, requiredComponent, status, fieldId]);

	return (
		<div
			className={clsx(
				styles.formField,
				styles[direction],
				styles[`size-${spacing}`],
			)}
		>
			<div className={styles.label}>{labelComponent}</div>
			<div className={styles.control}>
				{React.cloneElement<BasicInputProps>(control, {
					...inputProps,
					status,
					id: fieldId,
					required,
				})}
			</div>
			{description && (
				<div className={styles.description}>
					{typeof description === "string" ? (
						<MFieldDescription status={status}>{description}</MFieldDescription>
					) : (
						description
					)}
				</div>
			)}
		</div>
	);
};

export default MFormField;
