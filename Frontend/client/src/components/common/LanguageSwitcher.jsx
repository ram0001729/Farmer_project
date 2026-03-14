import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "bn", label: "বাংলা" },
  { code: "te", label: "తెలుగు" },
  { code: "ta", label: "தமிழ்" },
  { code: "mr", label: "मराठी" },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState(() => {
    const saved = localStorage.getItem("language") || i18n.language || "en";
    return languages.some((l) => l.code === saved) ? saved : "en";
  });
  const wrapperRef = useRef(null);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
    setActiveLanguage(lang);
    setMenuOpen(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem("language") || "en";
    setActiveLanguage(saved);
    document.documentElement.lang = saved;
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const activeLabel =
    languages.find((lang) => lang.code === activeLanguage)?.label || "English";

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className="px-4 py-2 rounded-lg bg-orange-400 text-black font-semibold hover:bg-orange-500 transition"
      >
        {activeLabel}
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-green-200 bg-white shadow-xl z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              type="button"
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-green-50 ${
                activeLanguage === lang.code ? "bg-green-100 text-green-900 font-semibold" : "text-gray-700"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;