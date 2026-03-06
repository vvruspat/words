import { AVAILABLE_LANGUAGES, Topic, TopicTranslation, type Language } from "@vvruspat/words-types";
import {
	MBadge,
	MButton,
	MFlex,
	MFormField,
	MInput,
	MList,
	MSelectOption,
	MSpinner,
	MText,
} from "@repo/uikit";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { addTopicAction } from "@/actions/addTopicAction";
import { addTopicTranslationAction } from "@/actions/addTopicTranslationAction";
import { fetchTopicTranslationsAction } from "@/actions/fetchTopicTranslationsAction";
import { updateTopicAction } from "@/actions/updateTopicAction";
import { updateTopicTranslationAction } from "@/actions/updateTopicTranslationAction";
import { useWordsStore } from "@/stores/useWordsStore";

const initialState: Omit<Topic, "id"> & { id?: number } = {
	title: "",
	description: "",
	language: "",
	created_at: "",
};

const isTopic = (value: unknown): value is Topic => {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		"title" in value &&
		typeof value.title === "string" &&
		"language" in value &&
		typeof value.language === "string"
	);
};

function TopicTranslationsPanel({ topicId }: { topicId: number }) {
	const [translations, setTranslations] = useState<Map<string, TopicTranslation>>(new Map());
	const [saving, setSaving] = useState<string | null>(null);
	const [values, setValues] = useState<Record<string, string>>({});

	useEffect(() => {
		fetchTopicTranslationsAction({ offset: 0, limit: 100, topics: [topicId] }).then((res) => {
			const map = new Map<string, TopicTranslation>();
			const initialValues: Record<string, string> = {};
			for (const t of res.items) {
				map.set(t.language, t);
				initialValues[t.language] = t.translation;
			}
			setTranslations(map);
			setValues(initialValues);
		});
	}, [topicId]);

	const handleSave = async (language: string) => {
		const value = values[language]?.trim();
		if (!value) return;

		setSaving(language);
		const existing = translations.get(language);
		try {
			if (existing) {
				const updated = await updateTopicTranslationAction(existing.id, value);
				setTranslations((prev) => new Map(prev).set(language, updated));
			} else {
				const created = await addTopicTranslationAction(topicId, value, language);
				setTranslations((prev) => new Map(prev).set(language, created));
			}
		} finally {
			setSaving(null);
		}
	};

	return (
		<MFlex direction="column" gap="l" align="stretch">
			<MText mode="tertiary">Translations</MText>
			{Object.entries(AVAILABLE_LANGUAGES).map(([lang, label]) => (
				<MFlex key={lang} direction="row" gap="s" align="center">
					<MText size="s" mode="secondary" style={{ minWidth: "70px" }}>
						{label}
					</MText>
					<MInput
						value={values[lang] ?? ""}
						onChange={(e) => setValues((prev) => ({ ...prev, [lang]: e.target.value }))}
						onKeyDown={(e) => {
							if (e.key === "Enter") void handleSave(lang);
						}}
						placeholder={`${label} translation`}
					/>
					<MButton
						size="s"
						mode="secondary"
						disabled={saving === lang || !values[lang]?.trim()}
						before={saving === lang && <MSpinner size="s" mode="primary" />}
						onClick={() => void handleSave(lang)}
					>
						{translations.has(lang) ? "Update" : "Add"}
					</MButton>
				</MFlex>
			))}
		</MFlex>
	);
}

export const ManageTopicsForm = () => {
	const { language, topics, addTopics, updateTopic } = useWordsStore();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [id, setId] = useState<number | undefined>();

	const titleRef = useRef<HTMLInputElement>(null);

	const topicsByLanguage = useMemo(
		() => topics.filter((topic) => topic.language === language),
		[topics, language],
	);

	const topicsOptions: MSelectOption[] = topicsByLanguage.map((topic) => ({
		key: topic.id.toString(),
		value: topic.title,
		after: (
			<MBadge mode="info">
				<MText mode="secondary">{topic.wordsCount ?? 0}</MText>
			</MBadge>
		),
		style: {
			paddingLeft: 0,
		},
	}));

	const [addState, addAction, addPending] = useActionState(
		addTopicAction,
		initialState,
	);

	const [updateState, updateAction, updatePending] = useActionState(
		updateTopicAction,
		{ ...initialState, id: 0 },
	);

	const formAction = id ? updateAction : addAction;
	const pending = id ? updatePending : addPending;

	useEffect(() => {
		if (addState.title && isTopic(addState)) {
			addTopics(addState);
		}
	}, [addState, addTopics]);

	useEffect(() => {
		if (updateState.title && isTopic(updateState)) {
			updateTopic(updateState);
		}
	}, [updateState, updateTopic]);

	const handleChooseTopic = (option: MSelectOption) => {
		const foundTopic = topicsByLanguage.find(
			(topic) => topic.id.toString() === option.key,
		);
		if (foundTopic) {
			setTitle(foundTopic.title);
			setDescription(foundTopic.description ?? "");
			setId(foundTopic.id);
		}
	};

	const reset = () => {
		setTitle("");
		setDescription("");
		setId(undefined);
		if (titleRef.current) {
			titleRef.current.focus();
		}
	};

	return (
		<MFlex
			direction="row"
			gap="4xl"
			align="stretch"
			justify="start"
			wrap="nowrap"
		>
			<MFlex direction="column" gap="2xl" align="stretch" justify="start">
				<form action={formAction}>
					<MFlex direction="column" gap="2xl" align="stretch" justify="start">
						<MText mode="tertiary">
							Language: {AVAILABLE_LANGUAGES[language as Language]}
						</MText>
						<input type="hidden" name="language" value={language} />
						{id && <input type="hidden" name="id" value={id} />}

						<MFormField
							label="Title"
							direction="column"
							spacing="full"
							mobileSpacing="full"
							required
							control={
								<MInput
									name="title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									ref={titleRef}
								/>
							}
							description="Enter title of the new topic."
						/>
						<MFormField
							label="Description"
							direction="column"
							spacing="full"
							mobileSpacing="full"
							control={
								<MInput
									name="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
								/>
							}
						/>

						<MButton
							type="submit"
							disabled={pending || !title}
							before={pending && <MSpinner size="s" mode="primary" />}
						>
							{id ? "Update" : "Create"}
						</MButton>
					</MFlex>
				</form>
				{id && <TopicTranslationsPanel topicId={id} />}
			</MFlex>
			<MFlex direction="column" gap="xl" align="stretch" justify="start">
				<MText mode="tertiary">Existing Topics</MText>
				<MFlex direction="column" gap="xs" align="stretch" justify="start">
					<MList
						options={topicsOptions}
						showDivider
						onChoose={handleChooseTopic}
					/>
					{id && (
						<MButton mode="tertiary" onClick={reset} size="s">
							Add new topic
						</MButton>
					)}
				</MFlex>
			</MFlex>
		</MFlex>
	);
};
