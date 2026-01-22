import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import RigthSidebar from "./RigthSidebar";
import { toast } from "sonner";
import NavigationM from "../ui/NavigationM2";
import HeaderM from "./HeaderM";
import {useIsMobile} from "../../hooks/useIsMobile"
//import NavigationM from "../ui/NavigationM";

const HomeLayout = () => {
  
  const isMobile = useIsMobile()

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

  const hideHeader = ["yawas"].some((route) =>
    location.pathname.includes(route)
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Header fijo */}

      {isMobile ? (  <HeaderM/>) : (<Header />)}
      {/* <Header /> */}
     
      {/* Layout Principal */}
      <div className={`${hideHeader ? "pt-0":"pt-16"} flex max-w-7xl mx-auto min-h-[calc(100vh-64px)]`}>{/**pt-16 */}
        {/* Sidebar Izquierdo - Desktop */}
        <LeftSidebar />

        {/* Contenido Principal - Feed */}
        <main className="flex-1 min-h-[500px] border-x border-emerald-500/10 dark:border-emerald-500/20 max-w-2xl mx-auto lg:mx-0">{/* min-h-[1050px]*/ }
          <div className=" sm:px-0 py-0 sm:py-6">{/**py-4 */}
            {" "}
            {/**px-4 */}
            <Outlet />
          </div>
        </main>

        {/* Sidebar Derecho - Desktop */}
        <RigthSidebar />
      </div>

      {/* Navegación Móvil Inferior - Estilo Threads */}
      <NavigationM />

      {/* Espaciado inferior para móvil (evitar que el contenido quede oculto detrás de la navegación) */}
      {!hideHeader && <div className="h-16 lg:hidden" />}
    </div>
  );
};

export default HomeLayout;
