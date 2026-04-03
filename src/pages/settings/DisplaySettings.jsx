import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Monitor } from "lucide-react";
// Importa tu contexto de tema si lo tienes, o tu ToggleThemeButton

const DisplaySettings = () => {
  const {  theme, setTheme } = useTheme();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Pantalla y diseño
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Personaliza cómo se ve YoMAC en tu dispositivo.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="font-bold text-lg dark:text-white mb-4">Apariencia</h3>

          {/* Opciones de Tema */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`
              flex flex-col items-center justify-center p-6 border-2 rounded-xl transition gap-3
                ${
                  theme === "light"
                    ? "border-emerald-500 bg-white"
                    : "border-gray-200 dark:border-gray-800 hover:border-emerald-500"
                }
              `}
            >
              <Sun size={24} className="text-amber-500" />
              <span className="font-medium text-gray-900 dark:text-white">Modo Claro</span>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`
                  flex flex-col items-center justify-center p-6 border-2 rounded-xl transition gap-3
                  ${
                    theme === "dark"
                      ? "border-emerald-500 bg-gray-900"
                      : "border-gray-200 dark:border-gray-800 hover:border-emerald-500"
                  }
                `}
            >
              <Moon size={24} className="text-emerald-400" />
              <span className="font-medium text-gray-900 dark:text-white">Modo Oscuro</span>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition gap-3
                      ${
                        theme === "system"
                          ? "border-emerald-500 bg-gray-50 dark:bg-gray-800"
                          : "border-gray-200 dark:border-gray-800 hover:border-emerald-500"
                      }
                    `}
            >
              <Monitor size={24} className="text-gray-500 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white text-center">
                Usar del sistema
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplaySettings;
