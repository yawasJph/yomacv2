import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Palette, Bug, Info, Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

const menuItems = [
  { id: "account", label: "Cuenta", icon: User, path: "/settings/account" },
  {
    id: "display",
    label: "Pantalla y diseño",
    icon: Palette,
    path: "/settings/display",
  },
  {
    id: "report",
    label: "Reportar un problema",
    icon: Bug,
    path: "/settings/report",
  },
  {
    id: "notifications",
    label: "Notificaciones",
    icon: Bell,
    path: "/settings/notifications",
  },
  {
    id: "about",
    label: "Acerca de YoMAC",
    icon: Info,
    path: "/settings/about",
  },
  // Puedes agregar más en el futuro: { id: "privacy", label: "Privacidad", icon: Shield, path: "/settings/privacy" }
];

const SettingsLayout = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Cabecera Móvil y Botones globales */}
      <div className="sticky top-15 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition"
          >
            <ArrowLeft size={20} className="dark:text-white" />
          </button>
          <h1 className="text-xl font-bold dark:text-white">Configuración</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row min-h-screen">
        {/* Menú Lateral (Sidebar en Desktop, Tabs en Mobile) */}
        <aside className="w-full lg:w-72 lg:border-r border-gray-100 dark:border-gray-800 p-4 lg:p-6 lg:min-h-screen shrink-0">
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition"
              >
                <ArrowLeft size={20} className="dark:text-white" />
              </button>
              <h1 className="text-2xl font-bold dark:text-white">Ajustes</h1>
            </div>
          </div>

          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
            {menuItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100"
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Área de Contenido Dinámico (Aquí se renderizan AccountSettings o DisplaySettings) */}
        <main className="flex-1 p-4 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;
