import { Moon, Sun } from "lucide-react";
import useDarkMode from "../../hooks/useDarkMode";
import { useTheme } from "@/context/ThemeContext";

const ToggleThemeButton = () => {
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-white dark:bg-neutral-900 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all cursor-pointer"
      title={`${isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}`}
    >
      {isDark ? (
        <Sun size={20} className="text-amber-500" />
      ) : (
        <Moon size={20} className="text-emerald-600" />
      )}
    </button>
  );
};

export default ToggleThemeButton;
