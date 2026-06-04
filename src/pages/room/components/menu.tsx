import squareIcon from "@/assets/icons/square.svg";
import lineIcon from "@/assets/icons/line.svg";
import eraserIcon from "@/assets/icons/eraser.svg";
import pencilIcon from "@/assets/icons/pencil.svg";
import textIcon from "@/assets/icons/text.svg";
import selectionIcon from "@/assets/icons/selection.svg";
import handIcon from "@/assets/icons/hand.svg";
import { toolTypes } from "@/constants";
import { useBoardStore } from "@/store/board.store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/theme.store";
import { useLangStore } from "@/store/lang.store";
import { Moon } from "lucide-react";
import { Sun } from "lucide-react";
import TRFlag from "@/assets/tr.png";
import ENFlag from "@/assets/en.png";

const IconButton = ({ src, type }: { src: string; type: string }) => {
  const { tool, setTool } = useBoardStore();

  const handleToolChange = () => {
    setTool(tool === type ? null : type);
  };

  return (
    <Button
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg border-none p-2 hover:bg-zinc-300 bg-white",
        tool === type && "bg-yellow-200 dark:bg-yellow-200"
      )}
      onClick={handleToolChange}
    >
      <img src={src} className="w-8 h-8" />
    </Button>
  );
};

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      className="flex items-center justify-center w-10 h-10 rounded-lg border-none p-2 hover:bg-zinc-300 bg-white text-primary"
      onClick={toggleTheme}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
};

const LangSwitcher = () => {
  const { lang, toggleLang } = useLangStore();

  return (
    <Button
      className="flex items-center justify-center w-10 h-10 rounded-lg border-none p-2 hover:bg-zinc-300 bg-white"
      onClick={toggleLang}
    >
      {lang === "en" ? (
        <img
          src={TRFlag}
          alt="Turkish"
          width={24}
          height={24}
          className="rounded-full"
        />
      ) : (
        <img
          src={ENFlag}
          alt="English"
          width={24}
          height={24}
          className="rounded-full"
        />
      )}
    </Button>
  );
};

const Menu = () => {
  return (
    <div className="z-10 left-2 top-1/2 -translate-y-1/2 absolute rounded-2xl flex flex-col flex-wrap items-center gap-2 bg-zinc-200 dark:bg-zinc-800 p-2 h-full max-h-fit">
      <IconButton src={selectionIcon} type={toolTypes.SELECTION} />
      <IconButton src={handIcon} type={toolTypes.HAND} />
      <IconButton src={squareIcon} type={toolTypes.SQUARE} />
      <IconButton src={lineIcon} type={toolTypes.LINE} />
      <IconButton src={eraserIcon} type={toolTypes.ERASER} />
      <IconButton src={pencilIcon} type={toolTypes.PENCIL} />
      <IconButton src={textIcon} type={toolTypes.TEXT} />
      <LangSwitcher />
      <ThemeSwitcher />
    </div>
  );
};

export default Menu;
