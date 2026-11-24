import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Dark theme"
      title={`Switch to ${nextTheme} theme`}
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/60 text-foreground transition-[background-color,color,border-color,transform] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:hover:scale-105 motion-safe:active:scale-95 motion-reduce:transition-none"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
