import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import RigthSidebar from "./RigthSidebar";
import { Home, Search, UserPen, Bookmark, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";

const HomeLayout = () => {
  // Navegación móvil inferior
  const mobileNavLinks = [
    { to: ".", icon: <Home size={24} />, text: "Inicio", end: true },
    { to: "users", icon: <Search size={24} />, text: "Buscar" },
    { to: "profile", icon: <UserPen size={24} />, text: "Perfil" },
    { to: "save-posts", icon: <Bookmark size={24} />, text: "Guardados" },
    { to: "create-post", icon: <Plus size={24} />, text: "Crear Post" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Header fijo */}
      <Header />

      {/* Layout Principal */}
      <div className="pt-16 flex max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
        {/* Sidebar Izquierdo - Desktop */}
        <LeftSidebar />

        {/* Contenido Principal - Feed */}
        <main className="flex-1 min-h-screen border-x border-emerald-500/10 dark:border-emerald-500/20 max-w-2xl mx-auto lg:mx-0">
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            <Outlet />
          </div>
        </main>

        {/* Sidebar Derecho - Desktop */}
        <RigthSidebar />
      </div>

      {/* Navegación Móvil Inferior - Estilo Threads */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-lg border-t-2 border-emerald-500/20 dark:border-emerald-500/30 z-50 lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavLinks.map((link) => (
            <NavLink
              key={link.text}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[60px] ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`
              }
            >
              {link.icon}
              <span className="text-xs font-medium">{link.text}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Espaciado inferior para móvil (evitar que el contenido quede oculto detrás de la navegación) */}
      <div className="h-16 lg:hidden" />
    </div>
  );
};

export default HomeLayout;
