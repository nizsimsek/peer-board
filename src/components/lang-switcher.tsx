import { Button } from "./ui/button";
import { useLangStore } from "@/store/lang.store";
import TRFlag from "@/assets/tr.png";
import ENFlag from "@/assets/en.png";
import { cn } from "@/lib/utils";

const LangSwitcher = ({ className }: { className?: string }) => {
  const { lang, toggleLang } = useLangStore();

  return (
    <Button
      onClick={toggleLang}
      className={cn(
        "bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-800",
        className
      )}
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

export default LangSwitcher;
