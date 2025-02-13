import { create } from "zustand";
import { persist } from "zustand/middleware";

type Lang = "tr" | "en";

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const updateLangClass = (lang: Lang) => {
  document.documentElement.classList.toggle("tr", lang === "tr");
};

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: "tr",
      setLang: (lang) => {
        updateLangClass(lang);
        set({ lang });
      },
      toggleLang: () =>
        set((state) => {
          const lang = state.lang === "tr" ? "en" : "tr";
          updateLangClass(lang);
          return { lang };
        }),
    }),
    {
      name: "lang-storage",
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            updateLangClass(state.lang);
          }
        };
      },
    }
  )
);
