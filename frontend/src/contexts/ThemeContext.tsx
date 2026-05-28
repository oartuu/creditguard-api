import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ isDark: true, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    (localStorage.getItem("theme") as Theme) ?? "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ isDark: theme === "dark", toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useChartTheme() {
  const { isDark } = useTheme();
  return {
    grid: isDark ? "#334155" : "#e2e8f0",
    tick: isDark ? "#94a3b8" : "#64748b",
    tooltip: {
      background: isDark ? "#0f172a" : "#ffffff",
      border: isDark ? "#334155" : "#e2e8f0",
      label: isDark ? "#f1f5f9" : "#0f172a",
    },
    legend: isDark ? "#94a3b8" : "#64748b",
  };
}
