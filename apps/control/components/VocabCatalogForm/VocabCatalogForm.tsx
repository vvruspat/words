"use client";
import { PutVocabcatalogResponse, PutVocabcatalogRequest, VocabCatalog } from "@repo/types";
import { MAlert, MButton, MFlex, MFormField, MHeading, MInput, MSpinner } from "@repo/uikit";
import { useActionState } from "react";
import { addVocabCatalogAction } from "@/actions/addVocabcatalog";
import { updateVocabCatalogAction } from "@/actions/updateVocabcatalog";

type VocabCatalogFormProps = {
	vocabCatalog?: VocabCatalog;
};

type VocabCatalogFormState = PutVocabcatalogResponse;

export const VocabCatalogForm = ({ vocabCatalog }: VocabCatalogFormProps) => {
	const title = vocabCatalog
		? "Update Vocabulary Catalog"
		: "Add Vocabulary Catalog";
	const buttonText = vocabCatalog ? "Update" : "Add";

	const initialState: VocabCatalogFormState = vocabCatalog
		? {
				...vocabCatalog,
			}
		: {
				id: 0,
				title: "New Vocabulary",
				created_at: new Date().toISOString(),
				owner: 0,
				language: "en",
			};

	const [state, formAction, isPending] = useActionState<VocabCatalogFormState, PutVocabcatalogRequest>(
		vocabCatalog ? addVocabCatalogAction : updateVocabCatalogAction,
		initialState,
	);

	return (
		<MFlex direction="column" gap="2xl">
			<MHeading mode="h1">{title}</MHeading>

			{state.error && (
				<MAlert mode="error">Error: {state.error.message}</MAlert>
			)}

			<form action={formAction}>
				{state.data?.id && (
					<input type="hidden" name="id" value={state.data.id} />
				)}

				<MFormField label={"Title"} name="title" required control={<MInput name="title" defaultValue={state.} />} />

				<MFlex direction="column" gap="2xl">
					<MButton
						type="submit"
						before={isPending ? <MSpinner size="s" /> : null}
					>
						{buttonText}
					</MButton>
				</MFlex>
			</form>
		</MFlex>
	);
};
