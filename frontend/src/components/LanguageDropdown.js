import React, { useState, useRef, useEffect } from "react";
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
  { code: "th", label: "Thailand" },
  { code: "ch", label: "Chinese" },
];

export default function LanguageDropdown() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = i18n.language;
  const ref = useRef();

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setOpen(false);
  };

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div className="lp-language-selector" ref={ref}>
      <button
        className="lp-language-dropdown-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        <Globe size={16} style={{ marginRight: "6px" }} />
        {LANGS.find((l) => l.code === current)?.label || "Language"}
        <span className={`arrow ${open ? "up" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="lp-language-dropdown-menu">
          {LANGS.map((lang) => (
            <div
              key={lang.code}
              className={`dropdown-item ${
                current === lang.code ? "active" : ""
              }`}
              onClick={() => changeLang(lang.code)}
            >
              {lang.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
