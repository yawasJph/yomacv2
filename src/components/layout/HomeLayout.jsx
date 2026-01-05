import { useEffect } from "react";
import { Outlet, useNavigate} from "react-router-dom";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import RigthSidebar from "./RigthSidebar";
import {
  Home,
  Search,
  UserPen,
  Bookmark,
  Gamepad2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import NavigationM from "../ui/NavigationM";

const HomeLayout = () => {
  const { user } = useAuth();
  // Navegación móvil inferior
  const mobileNavLinks = [
    { to: ".", icon: <Home size={24} />, text: "Inicio", end: true },
    { to: "search", icon: <Search size={24} />, text: "Buscar" },
    { to: `profile/${user?.id}`, icon: <UserPen size={24} />, text: "Perfil" },
    { to: "savedPost", icon: <Bookmark size={24} />, text: "Guardados" },
    { to: "games", icon: <Gamepad2 size={24} />, text: "Juegos" },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorDescription = params.get("error_description");
    if (errorDescription) {
      // Si el error viene del Trigger, el mensaje suele ser "Database error saving new user"
      // o el mensaje personalizado que pusiste en el RAISE EXCEPTION
      toast.error("Error de acceso", {
        description: "Ingresa con tu correo institucional.",
        duration: 5000,
      });

      // Limpiamos la URL para que el mensaje no vuelva a salir si el usuario recarga
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  
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
          <div className=" sm:px-0 py-4 sm:py-6">
            {" "}
            {/**px-4 */}
            <Outlet />
          </div>
        </main>

        {/* Sidebar Derecho - Desktop */}
        <RigthSidebar />
      </div>

      {/* Navegación Móvil Inferior - Estilo Threads */}
      <NavigationM mobileNavLinks={mobileNavLinks}/>

      {/* Espaciado inferior para móvil (evitar que el contenido quede oculto detrás de la navegación) */}
      <div className="h-16 lg:hidden" />
    </div>
  );
};

export default HomeLayout;
