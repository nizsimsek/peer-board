import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const updateThemeClass = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => {
        updateThemeClass(theme);
        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const theme = state.theme === "light" ? "dark" : "light";
          updateThemeClass(theme);
          return { theme };
        }),
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            updateThemeClass(state.theme);
          }
        };
      },
    }
  )
);
