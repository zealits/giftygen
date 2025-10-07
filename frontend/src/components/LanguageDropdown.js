import React from "react";
import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
  { code: "de", label: "Deutsch" },
];

export default function LanguageDropdown() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const changeLang = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <select
      onChange={changeLang}
      value={current}
      className="p-2 border rounded"
      style={{
    marginTop: "14px",
    padding: "3px 6px",
    fontSize: "13px",
    borderRadius: "6px",
    width: "90px",
    height: "29px",
    border: "1px solid #000000",
    backgroundColor: "#000000",
  }}
    >
      {LANGS.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
