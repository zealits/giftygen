import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// import your translation files
import en from "./locales/en/translation.json";
import de from "./locales/de/translation.json";
import hi from "./locales/hi/translation.json";
import mr from "./locales/mr/translation.json";
import Guja from "./locales/Guja/translation.json";
import panja from "./locales/panja/translation.json";
import Tamil from "./locales/Tamil/translation.json";
import telu from "./locales/telu/translation.json";
import kan from "./locales/kan/translation.json";
import Malay from "./locales/Malay/translation.json";
import ben from "./locales/ben/translation.json";
import Odi from "./locales/Odi/translation.json";
import urdu from "./locales/urdu/translation.json";
import ru from "./locales/ru/translation.json";
import th from "./locales/th/translation.json";
import ch from "./locales/ch/translation.json";


i18n
  .use(LanguageDetector) // 👈 detects browser or custom language
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      hi: { translation: hi },
      mr: { translation: mr },
      Guja: { translation: Guja },
      panja: { translation: panja },
      Tamil: { translation: Tamil },
      telu: { translation: telu },
      kan: { translation: kan },
      Malay: { translation: Malay },
      ben: { translation: ben },
      Odi: { translation: Odi },
      urdu: { translation: urdu },
      ru: { translation: ru },
      th: { translation: th },
      ch: { translation: ch },
      


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
