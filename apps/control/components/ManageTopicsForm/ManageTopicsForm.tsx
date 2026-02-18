import { AVAILABLE_LANGUAGES, Topic } from "@repo/types";
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
import { updateTopicAction } from "@/actions/updateTopicAction";
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
			<form action={formAction}>
				<MFlex direction="column" gap="2xl" align="stretch" justify="start">
					<MText mode="tertiary">
						Language: {AVAILABLE_LANGUAGES[language]}
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
