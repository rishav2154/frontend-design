import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const THEME_CLASSES: Theme[] = ["light", "dark"];
const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

const isTheme = (value: string | null): value is Theme =>
  value === "light" || value === "dark";

const getStoredTheme = (storageKey: string, fallback: Theme): Theme => {
  if (typeof window === "undefined") return fallback;

  try {
    const storedTheme = window.localStorage.getItem(storageKey);

    if (isTheme(storedTheme)) return storedTheme;
    if (storedTheme !== null) window.localStorage.removeItem(storageKey);
  } catch {
    // Storage can be unavailable in restricted browsing contexts.
  }

  return fallback;
};

const persistTheme = (storageKey: string, theme: Theme) => {
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // The active theme still applies when persistence is unavailable.
  }
};

const applyTheme = (theme: Theme) => {
  const root = window.document.documentElement;
  root.classList.remove(...THEME_CLASSES);
  root.classList.add(theme);
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  const themeColor = window.document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"][data-light][data-dark]',
  );
  const color = theme === "light" ? themeColor?.dataset.light : themeColor?.dataset.dark;

  if (themeColor && color) themeColor.content = color;
};

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "design-hive-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() =>
    getStoredTheme(storageKey, defaultTheme),
  );

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      setThemeState(isTheme(event.newValue) ? event.newValue : defaultTheme);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [defaultTheme, storageKey]);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      persistTheme(storageKey, nextTheme);
      setThemeState(nextTheme);
    },
    [storageKey],
  );

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      persistTheme(storageKey, nextTheme);
      return nextTheme;
    });
  }, [storageKey]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [setTheme, theme, toggleTheme],
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
