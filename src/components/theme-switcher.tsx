import { Moon } from "lucide-react";
import { Button } from "./ui/button";
import { Sun } from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import { cn } from "@/lib/utils";
const ThemeSwitcher = ({ className }: { className?: string }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      onClick={toggleTheme}
      className={cn(
        "bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-800",
        className
      )}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ThemeSwitcher;
