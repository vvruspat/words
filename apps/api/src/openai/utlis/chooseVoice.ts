import type { Language } from "@vvruspat/words-types";

const voiceMap = {
	// English
	en: "alloy",

	// Germanic
	de: "onyx",
	nl: "echo",
	sv: "sage",
	da: "sage",
	no: "sage",

	// Romance
	fr: "nova",
	es: "fable",
	it: "coral",
	pt: "shimmer",
	ro: "coral",

	// Slavic
	ru: "ballad",
	uk: "ballad",
	pl: "onyx",
	cs: "onyx",

	// Baltic / Finno-Ugric
	fi: "echo",
	et: "echo",
	hu: "onyx",

	// Asian
	ja: "shimmer",
	ko: "shimmer",
	zh: "nova",

	// Middle East
	ar: "sage",
	he: "sage",

	// Default fallback
	default: "alloy",
};

/**
 * Selects the best OpenAI TTS voice for a given language code.
 *
 * @param {string} lang - BCP-47 language code (e.g. "en", "de", "ru")
 * @returns {string} voice name
 */
export function chooseVoice(lang: Language) {
	if (!lang) return "alloy";

	return voiceMap[lang] || voiceMap.default;
}
