import type { WordTranslation } from "@vvruspat/words-types";
import { create } from "zustand";

interface WordsStore {
	translations: Map<
		WordTranslation["word"],
		Map<WordTranslation["language"], WordTranslation>
	>;
	setTranslations: (translations: WordTranslation[]) => void;
}

export const useTranslationsStore = create<WordsStore>()((set) => ({
	translations: new Map(),
	setTranslations: (translations: WordTranslation[]) =>
		set((prevState) => {
			// Create a new Map starting with the previous state
			const newTranslations = new Map(prevState.translations.entries());

			// Group translations by word
			const translationsByWord = new Map<
				WordTranslation["word"],
				WordTranslation[]
			>();
			for (const translation of translations) {
				const existing = translationsByWord.get(translation.word) || [];
				existing.push(translation);
				translationsByWord.set(translation.word, existing);
			}

			// Merge new translations with existing ones for each word
			for (const [word, newTranslationsForWord] of translationsByWord) {
				const existingLanguageMap =
					prevState.translations.get(word) || new Map();
				const mergedLanguageMap = new Map(existingLanguageMap);

				// Add or update translations for each language
				for (const translation of newTranslationsForWord) {
					mergedLanguageMap.set(translation.language, translation);
				}

				newTranslations.set(word, mergedLanguageMap);
			}

			return {
				translations: newTranslations,
			};
		}),
}));
