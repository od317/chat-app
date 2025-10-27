"use client";
import { useTheme } from "@/providers/ThemeProvider";
import { FiMoon, FiSun } from "react-icons/fi";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-highlights text-foreground hover:bg-primary hover:text-highlights transition-all duration-300 drop-shadow-glow"
    >
      {theme === "light" ? (
        // Moon icon for dark mode
        <FiMoon className="w-5 h-5" />
      ) : (
        // Sun icon for light mode
        <FiSun className="w-5 h-5" />
      )}
    </button>
  );
}
