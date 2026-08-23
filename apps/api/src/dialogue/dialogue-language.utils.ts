type SupportedScript =
	| "arabic"
	| "cyrillic"
	| "greek"
	| "han"
	| "hangul"
	| "hebrew"
	| "japanese"
	| "latin";

const LANGUAGE_SCRIPTS: Record<string, SupportedScript> = {
	ar: "arabic",
	be: "cyrillic",
	bg: "cyrillic",
	de: "latin",
	el: "greek",
	en: "latin",
	es: "latin",
	fa: "arabic",
	fr: "latin",
	he: "hebrew",
	it: "latin",
	ja: "japanese",
	kk: "cyrillic",
	ko: "hangul",
	ky: "cyrillic",
	mk: "cyrillic",
	nl: "latin",
	ru: "cyrillic",
	sr: "cyrillic",
	uk: "cyrillic",
	ur: "arabic",
	zh: "han",
};

const SCRIPT_CHARACTERS: Record<SupportedScript, string> = {
	arabic: "\\p{Script=Arabic}",
	cyrillic: "\\p{Script=Cyrillic}",
	greek: "\\p{Script=Greek}",
	han: "\\p{Script=Han}",
	hangul: "\\p{Script=Hangul}",
	hebrew: "\\p{Script=Hebrew}",
	japanese: "\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}",
	latin: "\\p{Script=Latin}",
};

const scriptFor = (language: string) =>
	LANGUAGE_SCRIPTS[language.toLocaleLowerCase().split("-")[0]];

export const containsLanguageScript = (value: string, language: string) => {
	const script = scriptFor(language);
	if (!script) return false;
	return new RegExp(`[${SCRIPT_CHARACTERS[script]}]`, "u").test(value);
};

export const detectNativeLanguageTerms = (
	content: string,
	nativeLanguage: string,
	targetLanguage: string,
) => {
	const nativeScript = scriptFor(nativeLanguage);
	if (!nativeScript || nativeScript === scriptFor(targetLanguage)) return [];
	const characters = SCRIPT_CHARACTERS[nativeScript];
	const pattern = new RegExp(
		`[${characters}\\p{M}]+(?:[-'’][${characters}\\p{M}]+)*`,
		"gu",
	);
	return [
		...new Set(
			(content.match(pattern) ?? []).map((term) => term.toLocaleLowerCase()),
		),
	];
};
