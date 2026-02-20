import { AVAILABLE_LANGUAGES, VocabCatalog } from "@vvruspat/words-types";
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
import { addCatalogAction } from "@/actions/addCatalogAction";
import { updateCatalogAction } from "@/actions/updateCatalogAction";
import { useWordsStore } from "@/stores/useWordsStore";

const initialState: Omit<VocabCatalog, "id"> & { id?: number } = {
	title: "",
	description: "",
	language: "",
	owner: 1,
	created_at: "",
};

const isVocabCatalog = (value: unknown): value is VocabCatalog => {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		"title" in value &&
		typeof value.title === "string" &&
		"language" in value &&
		typeof value.language === "string" &&
		"owner" in value &&
		typeof value.owner === "number" &&
		"created_at" in value &&
		typeof value.created_at === "string"
	);
};

export const ManageCatalogsForm = () => {
	const { language, catalogs, addCatalogs, updateCatalog } = useWordsStore();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [id, setId] = useState<number | undefined>();

	const titleRef = useRef<HTMLInputElement>(null);

	const catalogsByLanguage = useMemo(
		() => catalogs.filter((catalog) => catalog.language === language),
		[catalogs, language],
	);

	const catalogsOptions: MSelectOption[] = catalogsByLanguage.map(
		(catalog) => ({
			key: catalog.id.toString(),
			value: catalog.title,
			after: (
				<MBadge mode="info">
					<MText mode="secondary">{catalog.wordsCount ?? 0}</MText>
				</MBadge>
			),
			style: {
				paddingLeft: 0,
			},
		}),
	);

	const [addState, addAction, addPending] = useActionState(
		addCatalogAction,
		initialState,
	);

	const [updateState, updateAction, updatePending] = useActionState(
		updateCatalogAction,
		{ ...initialState, id: 0 },
	);

	const formAction = id ? updateAction : addAction;
	const pending = id ? updatePending : addPending;

	useEffect(() => {
		if (addState.title && isVocabCatalog(addState)) {
			addCatalogs(addState);
		}
	}, [addState, addCatalogs]);

	useEffect(() => {
		if (updateState.title && isVocabCatalog(updateState)) {
			updateCatalog(updateState);
		}
	}, [updateState, updateCatalog]);

	const handleChooseCatalog = (option: MSelectOption) => {
		const foundCatalog = catalogsByLanguage.find(
			(catalog) => catalog.id.toString() === option.key,
		);
		if (foundCatalog) {
			setTitle(foundCatalog.title);
			setDescription(foundCatalog.description ?? "");
			setId(foundCatalog.id);
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
					{/* TODO: Replace with actual owner */}
					<input type="hidden" name="owner" value={1} />
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
						description="Enter title of the new catalog."
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
				<MText mode="tertiary">Existing Catalogs</MText>
				<MFlex direction="column" gap="xs" align="stretch" justify="start">
					<MList
						options={catalogsOptions}
						showDivider
						onChoose={handleChooseCatalog}
					/>
					{id && (
						<MButton mode="tertiary" onClick={reset} size="s">
							Add new catalog
						</MButton>
					)}
				</MFlex>
			</MFlex>
		</MFlex>
	);
};
