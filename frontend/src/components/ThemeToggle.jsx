import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={dark ? "Modo claro" : "Modo oscuro"}
      data-testid="theme-toggle"
      className="fixed top-[72px] right-4 z-[60] w-10 h-10 rounded-full flex items-center justify-center bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95"
    >
      {dark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
    </button>
  );
}
