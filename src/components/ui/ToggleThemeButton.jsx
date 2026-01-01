import { Moon, Sun } from "lucide-react";
import useDarkMode from "../../hooks/useDarkMode";

const ToggleThemeButton = () => {
  const { darkMode, toggleTheme } = useDarkMode();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all cursor-pointer"
      title={`${darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}`}
    >
      {darkMode ? (
        <Sun size={20} className="text-amber-500" />
      ) : (
        <Moon size={20} className="text-emerald-600" />
      )}
    </button>
  );
};

export default ToggleThemeButton;
