import { AVAILABLE_LANGUAGES, type Language } from "@repo/types";

export const codeToLanguage = (code: Language) => AVAILABLE_LANGUAGES[code];
