import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";

import en from "./locales/en.json";
import nl from "./locales/nl.json";
import ru from "./locales/ru.json";

const locales = RNLocalize.getLocales();
const deviceLanguage = locales.length > 0 ? locales[0].languageCode : "en";

i18n.use(initReactI18next).init({
	compatibilityJSON: "v4",
	lng: deviceLanguage,
	fallbackLng: "en",
	resources: {
		en: { translation: en },
		nl: { translation: nl },
		ru: { translation: ru },
	},
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
