import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import RigthSidebar from "./RigthSidebar";
import { Home, Search, UserPen, Bookmark, Plus, TriangleAlertIcon, Info } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const HomeLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Navegación móvil inferior
  const mobileNavLinks = [
    { to: ".", icon: <Home size={24} />, text: "Inicio", end: true },
    { to: "search", icon: <Search size={24} />, text: "Buscar" },
    { to: "profile", icon: <UserPen size={24} />, text: "Perfil" },
    { to: "save-posts", icon: <Bookmark size={24} />, text: "Guardados" },
    { to: "create-post", icon: <Plus size={24} />, text: "Crear Post" },
  ];

  const handleCreatePost = () => {
    if (user) {
      navigate("create-post");
    } else {
      navigate("login");
      toast.error("Debes iniciar sesión para crear una publicación", {
       
        
        // ⏳ Duración del toast (por ejemplo, 6 segundos)
        duration: 6000, 
      
        // 🎨 Clases CSS personalizadas para el contenedor del toast
        // - Añadimos una sombra y un borde más sutil
        className: "shadow-lg border-l-4 border-red-600", 
        
        // 🔑 Botón de Acción: "Ayuda"
        action: {
          label: "Ayuda",
          onClick: () => {
            // 💡 Lógica que se ejecuta al hacer clic en el botón
            // Por ejemplo, puedes abrir un modal de soporte o una nueva pestaña
            console.log("Abriendo página de soporte...");
            toast.info("Ingresa con tu correo institucional del MAC",{
              icon: <Info className="w-5 h-5 text-indigo-300"/>
            });
            // window.open('https://tudominio.com/ayuda', '_blank');
          },
          // Opcional: Clases CSS para el botón de acción
          className: "bg-white text-gray-800 hover:bg-gray-100 font-semibold",
        },
        
        // 🖼️ Opcional: Icono personalizado (si no te gusta el predeterminado)
         icon: <TriangleAlertIcon className="w-5 h-5 text-red-500" /> // Asegúrate de importar el icono
      });
    }
  };
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Header fijo */}
      <Header />

      {/* Layout Principal */}
      <div className="pt-16 flex max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
        {/* Sidebar Izquierdo - Desktop */}
        <LeftSidebar />

        {/* Contenido Principal - Feed */}
        <main className="flex-1 min-h-[1050px] border-x border-emerald-500/10 dark:border-emerald-500/20 max-w-2xl mx-auto lg:mx-0">
          <div className=" sm:px-0 py-4 sm:py-6"> {/**px-4 */}
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
          <button
            className="flex items-center gap-4 px-4 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-400 text-white font-semibold mt-4 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
            onClick={handleCreatePost}
          >
            <Plus size={25} />
           
          </button>
        </div>
      </nav>

      {/* Espaciado inferior para móvil (evitar que el contenido quede oculto detrás de la navegación) */}
      <div className="h-16 lg:hidden" />
    </div>
  );
};

export default HomeLayout;
