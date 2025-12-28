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
	addCatalogs: (catalog: VocabCatalog) => void;
	removeCatalog: (catalog: VocabCatalog) => void;
	updateCatalog: (catalog: VocabCatalog) => void;
	addTopics: (topic: Topic) => void;
	removeTopic: (topic: Topic) => void;
	updateTopic: (topic: Topic) => void;
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
			addTopics: (topic: Topic) => set((state) => ({ topics: [...state.topics, topic] })),
			removeTopic: (topic: Topic) => set((state) => ({ topics: state.topics.filter((t) => t.id !== topic.id) })),
			updateTopic: (topic: Topic) => set((state) => ({ topics: state.topics.map((t) => t.id === topic.id ? topic : t) })),
			setCatalogs: (catalogs: VocabCatalog[]) => set({ catalogs }),
			addCatalogs: (catalog: VocabCatalog) => set((state) => ({ catalogs: [...state.catalogs, catalog] })),
			removeCatalog: (catalog: VocabCatalog) => set((state) => ({ catalogs: state.catalogs.filter((c) => c.id !== catalog.id) })),
			updateCatalog: (catalog: VocabCatalog) => set((state) => ({ catalogs: state.catalogs.map((c) => c.id === catalog.id ? catalog : c) })),
		}),
		{
			name: "words-store",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
