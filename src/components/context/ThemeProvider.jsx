
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("devflow-theme");

    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const initial =
      saved ?? (systemDark ? "dark" : "light");

    setTheme(initial);

    document.documentElement.classList.toggle(
      "dark",
      initial === "dark"
    );

    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next =
      theme === "light" ? "dark" : "light";

    setTheme(next);

    localStorage.setItem(
      "devflow-theme",
      next
    );

    document.documentElement.classList.toggle(
      "dark",
      next === "dark"
    );
  };

  if (!mounted) {
    return (
      <ThemeContext.Provider
        value={{
          theme: "light",
          toggleTheme: () => {},
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
