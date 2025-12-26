import { AVAILABLE_LANGUAGES, Language } from "@repo/types";

export const codeToLanguage = (code: Language) => AVAILABLE_LANGUAGES[code];
