import type { Language, Topic, VocabCatalog, Word } from "@repo/types";
import { isWord } from "@repo/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface WordUpdateEvent {
	type: "update" | "create" | "delete";
	word: unknown;
}

// Store EventSource outside of Zustand state since it's not serializable
let eventSourceInstance: EventSource | null = null;

interface WordsStore {
	language: Language;
	selectedCatalog: string;
	selectedTopic: string;
	selectedStatus: "all" | "processing" | "processed";
	topics: Topic[];
	catalogs: VocabCatalog[];
	connected: boolean;
	words: Word[];
	pendingGenerationCount: number;
	pendingGenerationFilter: {
		language: Language;
		catalog: number;
		topic: number;
	} | null;

	setLanguage: (language: Language) => void;
	setSelectedCatalog: (catalog: string) => void;
	setSelectedTopic: (topic: string) => void;
	setSelectedStatus: (status: "all" | "processing" | "processed") => void;
	setTopics: (topics: Topic[]) => void;
	setCatalogs: (catalogs: VocabCatalog[]) => void;
	addCatalogs: (catalog: VocabCatalog) => void;
	removeCatalog: (catalog: VocabCatalog) => void;
	updateCatalog: (catalog: VocabCatalog) => void;
	addTopics: (topic: Topic) => void;
	removeTopic: (topic: Topic) => void;
	updateTopic: (topic: Topic) => void;
	setWords: (words: Word[]) => void;
	removeWords: (ids: number[]) => void;
	addPendingGenerationCount: (
		count: number,
		filter: {
			language: Language;
			catalog: number;
			topic: number;
		},
	) => void;
	adjustPendingGenerationCount: (delta: number) => void;

	connect: () => void;
	disconnect: () => void;
}

export const useWordsStore = create<WordsStore>()(
	persist(
		(set, get) => ({
			language: "en",
			selectedCatalog: "all",
			selectedTopic: "all",
			selectedStatus: "all",
			topics: [],
			catalogs: [],
			connected: false,
			words: [],
			pendingGenerationCount: 0,
			pendingGenerationFilter: null,
			setWords: (words: Word[]) => set({ words }),
			removeWords: (ids: number[]) =>
				set((state) => ({
					words: state.words.filter((w) => !ids.includes(w.id)),
				})),
			addPendingGenerationCount: (count, filter) =>
				set((state) => {
					const sameFilter =
						state.pendingGenerationFilter?.language === filter.language &&
						state.pendingGenerationFilter?.catalog === filter.catalog &&
						state.pendingGenerationFilter?.topic === filter.topic;
					return {
						pendingGenerationCount: sameFilter
							? state.pendingGenerationCount + count
							: count,
						pendingGenerationFilter: filter,
					};
				}),
			adjustPendingGenerationCount: (delta) =>
				set((state) => ({
					pendingGenerationCount: Math.max(
						0,
						state.pendingGenerationCount + delta,
					),
				})),
			setLanguage: (language) => set({ language }),
			setSelectedCatalog: (selectedCatalog) => set({ selectedCatalog }),
			setSelectedTopic: (selectedTopic) => set({ selectedTopic }),
			setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
			setTopics: (topics: Topic[]) => set({ topics }),
			addTopics: (topic: Topic) =>
				set((state) => ({ topics: [...state.topics, topic] })),
			removeTopic: (topic: Topic) =>
				set((state) => ({
					topics: state.topics.filter((t) => t.id !== topic.id),
				})),
			updateTopic: (topic: Topic) =>
				set((state) => ({
					topics: state.topics.map((t) => (t.id === topic.id ? topic : t)),
				})),
			setCatalogs: (catalogs: VocabCatalog[]) => set({ catalogs }),
			addCatalogs: (catalog: VocabCatalog) =>
				set((state) => ({ catalogs: [...state.catalogs, catalog] })),
			removeCatalog: (catalog: VocabCatalog) =>
				set((state) => ({
					catalogs: state.catalogs.filter((c) => c.id !== catalog.id),
				})),
			updateCatalog: (catalog: VocabCatalog) =>
				set((state) => ({
					catalogs: state.catalogs.map((c) =>
						c.id === catalog.id ? catalog : c,
					),
				})),
			connect: () => {
				const state = get();
				// Don't connect if already connected
				if (state.connected || eventSourceInstance) {
					return;
				}

				// Only connect in browser environment
				if (typeof window === "undefined") {
					return;
				}

				try {
					// Determine the API URL (client-side uses /api, server-side would need process.env.API_SERVER)
					const apiUrl =
						process.env.NEXT_PUBLIC_API_SERVER || "http://localhost:3000";
					const eventSourceUrl = `${apiUrl}/word/events`;

					eventSourceInstance = new EventSource(eventSourceUrl);

					eventSourceInstance.onopen = () => {
						set({ connected: true });
						console.log("SSE connection established");
					};

					eventSourceInstance.onmessage = (event) => {
						try {
							// Skip heartbeat messages
							if (event.data.startsWith(":")) {
								return;
							}

							const data: WordUpdateEvent = JSON.parse(event.data);

							const word = data.word;

							if (isWord(word)) {
								if (data.type === "update") {
									set((state) => ({
										words: state.words.map((w) =>
											w.id === word.id ? word : w,
										),
									}));
								} else if (data.type === "create") {
									set((state) => ({
										words: [...state.words, word],
										pendingGenerationCount:
											state.pendingGenerationFilter?.language === word.language &&
											state.pendingGenerationFilter?.catalog === word.catalog &&
											state.pendingGenerationFilter?.topic === word.topic
												? Math.max(0, state.pendingGenerationCount - 1)
												: state.pendingGenerationCount,
									}));
								} else if (data.type === "delete") {
									set((state) => ({
										words: state.words.filter((w) => w.id !== word.id),
									}));
								}
							}
						} catch (error) {
							console.error("Error parsing SSE event:", error);
						}
					};

					eventSourceInstance.onerror = (error) => {
						const currentState = get();
						// Only log if we were previously connected, or if this is a new connection attempt
						if (currentState.connected) {
							console.error("SSE connection error:", error);
						}
						set({ connected: false });

						// Clean up the failed connection
						if (eventSourceInstance) {
							eventSourceInstance.close();
							eventSourceInstance = null;
						}

						// Attempt to reconnect after a delay (only if not manually disconnected)
						setTimeout(() => {
							const currentState = get();
							// Only reconnect if we're not connected and there's no active instance
							// This prevents infinite reconnection loops
							if (!currentState.connected && !eventSourceInstance) {
								// Check if the API server is likely available before reconnecting
								// This is a simple check - you might want to make it more sophisticated
								get().connect();
							}
						}, 5000);
					};
				} catch (error) {
					console.error("Failed to create SSE connection:", error);
					set({ connected: false });
					eventSourceInstance = null;
				}
			},
			disconnect: () => {
				if (eventSourceInstance) {
					eventSourceInstance.close();
					eventSourceInstance = null;
					set({ connected: false });
				}
			},
		}),
		{
			name: "words-store",
			storage: createJSONStorage(() => localStorage),
			version: 1,
			migrate: (persistedState, _version) => {
				const state = persistedState as Record<string, unknown>;
				return {
					...state,
					selectedCatalog:
						state.selectedCatalog === "" || state.selectedCatalog == null
							? "all"
							: state.selectedCatalog,
					selectedTopic:
						state.selectedTopic === "" || state.selectedTopic == null
							? "all"
							: state.selectedTopic,
					selectedStatus:
						state.selectedStatus == null ? "all" : state.selectedStatus,
				};
			},
			partialize: (state) => ({
				// Don't persist connection state
				language: state.language,
				selectedCatalog: state.selectedCatalog,
				selectedTopic: state.selectedTopic,
				selectedStatus: state.selectedStatus,
				topics: state.topics,
				catalogs: state.catalogs,
			}),
		},
	),
);
