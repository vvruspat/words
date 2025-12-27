import type { Language, Topic, VocabCatalog } from "@repo/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface WordsStore {
	language: Language;
	selectedCatalog: string;
	selectedTopic: string;
	topics: Topic[];
	catalogs: VocabCatalog[];
	setLanguage: (language: Language) => void;
	setSelectedCatalog: (catalog: string) => void;
	setSelectedTopic: (topic: string) => void;
	setTopics: (topics: Topic[]) => void;
	setCatalogs: (catalogs: VocabCatalog[]) => void;
}

export const useWordsStore = create<WordsStore>()(
	persist(
		(set) => ({
			language: "en",
			selectedCatalog: "",
			selectedTopic: "",
			topics: [],
			catalogs: [],
			setLanguage: (language) => set({ language }),
			setSelectedCatalog: (selectedCatalog) => set({ selectedCatalog }),
			setSelectedTopic: (selectedTopic) => set({ selectedTopic }),
			setTopics: (topics: Topic[]) => set({ topics }),
			setCatalogs: (catalogs: VocabCatalog[]) => set({ catalogs }),
		}),
		{
			name: "words-store",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
