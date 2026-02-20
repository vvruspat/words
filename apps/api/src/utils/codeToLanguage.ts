import { AVAILABLE_LANGUAGES, type Language } from "@vvruspat/words-types";

export const codeToLanguage = (code: Language) => AVAILABLE_LANGUAGES[code];
