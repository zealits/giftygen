import i18n from "i18next";
import { initReactI18next } from "react-i18next";
//import LanguageDetector from "i18next-browser-languagedetector";

// import your translation files
import en from "./locales/en/translation.json";
import de from "./locales/de/translation.json";
import hi from "./locales/hi/translation.json";
import mr from "./locales/mr/translation.json";

i18n
  //.use(LanguageDetector) // 👈 detects browser or custom language
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      hi: { translation: hi },
      mr: { translation: mr },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      // Order of language detection
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;
