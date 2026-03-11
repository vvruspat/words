"use client";

import {
	AVAILABLE_LANGUAGES,
	type Language,
} from "@vvruspat/words-types";
import {
	MButton,
	MFlex,
	MFormField,
	MSelect,
	type MSelectOption,
	MSpinner,
	MText,
} from "@repo/uikit";
import { useRef, useState } from "react";
import { importTopicsAction } from "@/actions/importTopicsAction";
import { useWordsStore } from "@/stores/useWordsStore";

type ImportResult = {
	topicsCreated: number;
	topicsFound: number;
	jobsQueued: number;
};

const languageOptions: MSelectOption[] = Object.entries(AVAILABLE_LANGUAGES).map(
	([key, value]) => ({ key, value }),
);

export const ImportTopicsForm = () => {
	const { language: storeLanguage } = useWordsStore();
	const [language, setLanguage] = useState<string>(storeLanguage ?? "");
	const [fileName, setFileName] = useState<string>("");
	const [parsedTopics, setParsedTopics] = useState<
		Array<Record<string, string | number>> | null
	>(null);
	const [parseError, setParseError] = useState<string>("");
	const [pending, setPending] = useState(false);
	const [result, setResult] = useState<ImportResult | null>(null);
	const [submitError, setSubmitError] = useState<string>("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setParseError("");
		setParsedTopics(null);
		setResult(null);
		setSubmitError("");

		const file = e.target.files?.[0];
		if (!file) return;

		setFileName(file.name);

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const json = JSON.parse(event.target?.result as string);
				if (!Array.isArray(json)) {
					setParseError("File must contain a JSON array of topics.");
					return;
				}
				for (const item of json) {
					if (typeof item !== "object" || typeof item.topic !== "string") {
						setParseError(
							'Each item must be an object with a "topic" string field.',
						);
						return;
					}
				}
				setParsedTopics(json as Array<Record<string, string | number>>);
			} catch {
				setParseError("Invalid JSON file.");
			}
		};
		reader.readAsText(file);
	};

	const handleSubmit = async () => {
		if (!parsedTopics || !language) return;
		setPending(true);
		setSubmitError("");
		setResult(null);
		try {
			const response = (await importTopicsAction(
				language,
				parsedTopics,
			)) as ImportResult;
			setResult(response);
		} catch (err) {
			setSubmitError(
				err instanceof Error ? err.message : "Import failed. Please try again.",
			);
		} finally {
			setPending(false);
		}
	};

	return (
		<MFlex direction="column" gap="2xl" align="stretch" justify="start">
			<MFormField
				label="Language"
				required
				direction="column"
				control={
					<MSelect
						name="language"
						options={languageOptions}
						value={language}
						onChange={(e) => {
							setLanguage(e.target.value as Language);
							setResult(null);
						}}
					/>
				}
			/>

			<MFormField
				label="Topics JSON file"
				required
				direction="column"
				description="Select a JSON file with an array of topics and level/word-count entries."
				control={
					<MFlex direction="row" gap="s" align="center">
						<input
							ref={fileInputRef}
							type="file"
							accept=".json"
							style={{ display: "none" }}
							onChange={handleFileChange}
						/>
						<MButton
							mode="secondary"
							onClick={() => fileInputRef.current?.click()}
						>
							Choose file
						</MButton>
						<MText mode={fileName ? "primary" : "secondary"}>
							{fileName || "No file selected"}
						</MText>
					</MFlex>
				}
			/>

			{parseError && <MText mode="negative">{parseError}</MText>}

			{parsedTopics && (
				<MText mode="secondary">
					{parsedTopics.length} topic(s) ready to import.
				</MText>
			)}

			{result && (
				<MFlex direction="column" gap="s">
					<MText mode="positive">Import queued successfully.</MText>
					<MText mode="secondary">
						Topics created: {result.topicsCreated} | Found: {result.topicsFound}{" "}
						| Word generation jobs queued: {result.jobsQueued}
					</MText>
				</MFlex>
			)}

			{submitError && <MText mode="negative">{submitError}</MText>}

			<MButton
				mode="primary"
				disabled={pending || !parsedTopics || !language}
				before={pending && <MSpinner size="s" mode="primary" />}
				onClick={() => void handleSubmit()}
			>
				Import
			</MButton>
		</MFlex>
	);
};
