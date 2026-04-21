import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import "../styles/ThemeToggle.css";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      className="theme-toggle-btn"
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      <span>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
