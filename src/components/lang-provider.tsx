import { useEffect } from "react";
import { useLangStore } from "@/store/lang.store";

export function LangProvider({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useLangStore();

  useEffect(() => {
    const getSystemLang = () =>
      window.navigator.language.startsWith("tr") ? "tr" : "en";

    if (!lang) {
      setLang(getSystemLang());
    }

    const mediaQuery = window.matchMedia("(prefers-language: tr)");
    const handleLangChange = (e: MediaQueryListEvent) => {
      if (!lang) {
        setLang(e.matches ? "tr" : "en");
      }
    };

    mediaQuery.addEventListener("change", handleLangChange);
    return () => mediaQuery.removeEventListener("change", handleLangChange);
  }, [lang, setLang]);

  return children;
}
