"use client";
import { createContext, useContext } from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

type Theme = "light" | "dark" | "system";
interface ThemeContextValue { theme: Theme | undefined; setTheme: (theme: Theme) => void; toggleTheme: () => void; }

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeProviderInternal>{children}</ThemeProviderInternal>
    </NextThemesProvider>
  );
}

function ThemeProviderInternal({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useNextTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme: theme as Theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
