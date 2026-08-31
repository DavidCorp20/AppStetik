import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("stetik-theme") || "dark"; } catch { return "dark"; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-stetik-theme", theme);
    document.body.classList.toggle("stetik-dark", theme === "dark");
    document.body.classList.toggle("stetik-light", theme === "light");
    try { localStorage.setItem("stetik-theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(current => current === "dark" ? "light" : "dark");
  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe utilizarse dentro de ThemeProvider");
  return context;
}
