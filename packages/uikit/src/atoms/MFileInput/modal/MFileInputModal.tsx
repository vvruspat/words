import clsx from "clsx";

import { extension } from "mime-types";
import { type KeyboardEvent, type RefObject, useState } from "react";
import { MButton } from "../../MButton";
import { MCard } from "../../MCard";
import { MFlex } from "../../MFlex";
import { MIconTrashSimple, MIconX } from "../../MIcon";
import { MList } from "../../MList";
import { MText } from "../../MText";

import styles from "./MFileInputModal.module.css";
import "./MFileInputModal.vars.css";
import { MCaption } from "../../MCaption";

export const MFileInputModal = ({
	open,
	files = [],
	onFilesDropped,
	onFileRemoved,
	onFilesReset,
	onClose,
	onSave,
	inputRef,
}: {
	onClose?: () => void;
	onSave?: () => void;
	files?: File[];
	onFilesDropped: (files: File[]) => void;
	onFileRemoved: (fileName: File["name"]) => void;
	onFilesReset?: () => void;
	inputRef: RefObject<HTMLInputElement | null>;
	open: boolean;
}) => {
	const [dragOver, setDragOver] = useState(false);

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();

		setDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setDragOver(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (!inputRef.current) return;

		// read <input> props
		const acceptAttr = inputRef.current.accept || "";
		const multiple = inputRef.current.multiple;

		// build accept patterns array
		const patterns = acceptAttr
			.split(",")
			.map((p) => p.trim().toLowerCase())
			.filter(Boolean);

		// helper: does file match any accept pattern?
		const fileAccepted = (file: File) => {
			if (patterns.length === 0) return true;

			const name = file.name.toLowerCase();
			const type = file.type.toLowerCase();

			return patterns.some((pattern) => {
				if (pattern.startsWith(".")) {
					return name.endsWith(pattern);
				}

				if (pattern.endsWith("/*")) {
					const main = pattern.replace("/*", "");
					return type.startsWith(`${main}/`);
				}

				return type === pattern;
			});
		};

		// filter and respect multiple flag
		let dropped = Array.from(e.dataTransfer.files).filter(fileAccepted);

		if (!multiple && dropped.length > 1) {
			// I know that if length > 1 the dropped[0] is always not undefined, but typescript stil coplains :)
			dropped = dropped[0] ? [dropped[0]] : [];
		}

		onFilesDropped(dropped);
		setDragOver(false);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onSave?.() || onClose?.();
		}

		if (e.key === "Escape") {
			e.preventDefault();
			onClose?.();
		}
	};

	return (
		<MFlex
			align="center"
			justify="center"
			className={clsx(styles.overlay, open && styles.open)}
		>
			<MCard
				className={styles.modal}
				tabIndex={0}
				onKeyDown={handleKeyDown}
				header={
					<MFlex justify="space-between">
						{files.length > 0 && (
							<MButton mode="tertiary" onClick={onFilesReset}>
								Reset
							</MButton>
						)}

						<MButton mode="round" onClick={() => onClose?.()}>
							<MIconX mode="regular" />
						</MButton>
					</MFlex>
				}
				footer={
					<MFlex justify="end">
						<MButton
							mode="primary"
							disabled={files.length === 0}
							onClick={() => onSave?.() || onClose?.()}
						>
							Save
						</MButton>
						<MButton mode="tertiary" onClick={() => onClose?.()}>
							Cancel
						</MButton>
					</MFlex>
				}
				gap="2xl"
			>
				<MFlex
					direction="column"
					align="center"
					justify="center"
					onDragOver={handleDragOver}
					onDragEnter={handleDragOver}
					onDragLeave={handleDragLeave}
					onDragEnd={handleDragLeave}
					onDragExit={handleDragLeave}
					onDrop={handleDrop}
					onClick={() => inputRef.current?.click()}
					className={clsx(styles.dropArea, dragOver && styles.dragOver)}
					data-testid="drop-area"
				>
					<MText>Drag & drop files here, or click to select</MText>
					{inputRef.current?.accept && (
						<MCaption>
							Accepted file types:{" "}
							{inputRef.current.accept
								.split(",")
								.map((mime) => extension(mime.trim()) || mime.trim())
								.join(", ")}
						</MCaption>
					)}
				</MFlex>

				<MList
					options={files.map((file, _i) => ({
						key: file.name,
						value: (
							<MFlex align="center" justify="space-between">
								<MText>{file.name}</MText>
								<MButton
									mode="round"
									aria-label={`Remove ${file.name}`}
									onClick={() => onFileRemoved(file.name)}
								>
									<MIconTrashSimple mode="regular" />
								</MButton>
							</MFlex>
						),
					}))}
				/>
			</MCard>
		</MFlex>
	);
};
