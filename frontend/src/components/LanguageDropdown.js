import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import "../pages/marketing/LandingPage.css";

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
  { code: "de", label: "Deutsch" },
  { code: "Guja", label: "ગુજરાતી" },
  { code: "panja", label: "ਪੰਜਾਬੀ" },
  { code: "Tamil", label: "தமிழ்" },
  { code: "telu", label: "తెలుగు" },
  { code: "kan", label: "ಕನ್ನಡ" },
  { code: "Malay", label: "മലയാളം" },
  { code: "ben", label: "বাংলা" },
  { code: "Odi", label: "ଓଡ଼ିଆ" },
  { code: "urdu", label: "اردو" },
  { code: "ru", label: "Russia" },
  { code: "th", label: "thiland" },
  { code: "ch", label: "chinese" },
];

export default function LanguageDropdown({ variant = "desktop" }) {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const changeLang = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  if (variant === "mobile") {
    return (
      <div className="lp-mobile-language">
        <label className="lp-mobile-language__label">
          <Globe size={18} />
          Language / भाषा
        </label>
        <select 
          onChange={changeLang} 
          value={current}
          className="lp-mobile-language-dropdown"
          aria-label="Select language"
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Desktop variant
  return (
    <div className="lp-language-selector">
      <select 
        onChange={changeLang} 
        value={current}
        className="lp-language-dropdown"
        aria-label="Select language"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}