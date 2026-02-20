import type { Language } from "@vvruspat/words-types";

/**
 * TTS instruction phrase translated into each available language.
 * Equivalent to: "Generate clear pronunciation of the word in {language}. Speak as a native {language} speaker teacher."
 */
const AUDIO_INSTRUCTIONS: Record<Language, string> = {
	en: "Generate clear pronunciation of the word in English. Speak as a native English speaker teacher.",
	es: "Genera una pronunciación clara de la palabra en español. Habla como un profesor nativo de español.",
	fr: "Génère une prononciation claire du mot en français. Parle comme un professeur natif français.",
	de: "Erzeuge eine klare Aussprache des Wortes auf Deutsch. Sprich wie ein muttersprachlicher Deutschlehrer.",
	it: "Genera una pronuncia chiara della parola in italiano. Parla come un insegnante madrelingua italiano.",
	ru: "Создай чёткое произношение слова на русском языке. Говори как учитель — носитель русского языка.",
	el: "Δημιούργησε σαφή προφορά της λέξης στα ελληνικά. Μίλα σαν δάσκαλος ελληνικής με μητρική γλώσσα τα ελληνικά.",
	nl: "Genereer een duidelijke uitspraak van het woord in het Nederlands. Spreek als een native Nederlandse docent.",
};

export function audioInstructions(language: Language): string {
	return AUDIO_INSTRUCTIONS[language] ?? AUDIO_INSTRUCTIONS.en;
}
