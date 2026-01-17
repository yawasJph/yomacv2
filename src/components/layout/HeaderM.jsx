import { useState } from "react";
import {
  X,
  Bookmark,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../hooks/useProfile";
import ToggleThemeButton from "../ui/ToggleThemeButton";
import UserCredits from "../games/UserCredits";
import Logo from "../ui/Logo";
import NotificationIcon from "../ui/NotificationIcon";

const HeaderM = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, signout } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const navigate = useNavigate();

  const menuItems = [
    { icon: <Bookmark size={20} />, text: "Guardados", path: "/savedPost" },
    {
      icon: <ShoppingBag size={20} />,
      text: "YoMAC Store",
      path: "/games/store",
    },
    {
      icon: <Settings size={20} />,
      text: "Configuración",
      path: "/editProfile",
    },
  ];

  const onViewCredits = ["games"].some((route) =>
    location.pathname.includes(route)
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl z-40 border-b border-gray-100 dark:border-neutral-900 lg:hidden">
        <div className="flex items-center justify-between h-full px-4">
          {/* IZQUIERDA: Logo y Nombre */}

          {/* <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-white font-black text-xs">Y</span>
            </div>
            <h1
              className={`text-xl font-black tracking-tighter dark:text-white ${
                onViewCredits && "max-sm:hidden"
              }`}
            >
              YoMAC
            </h1> */}
          <Logo />

          {user && onViewCredits && <UserCredits userId={user?.id} />}

          {!onViewCredits && <div className="flex items-center gap-2">
            <button
              className="relative p-2 text-gray-600 dark:text-gray-400"
              onClick={() => navigate("search")}
            >
              <Search size={24} />
            </button>
            
          </div>}

          {/* DERECHA: Notificaciones y Avatar */}
          <div className="flex items-center gap-2">
            {/* {!onViewCredits && <ToggleThemeButton />} */}
            <ToggleThemeButton />

            {/* <button
              className="relative p-2 text-gray-600 dark:text-gray-400"
              onClick={() => navigate("notifications")}
            >
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-neutral-950"></span>
            </button> */}
            {user && <NotificationIcon />}

            
            {user ? (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="ml-1 active:scale-90 transition-transform"
              >
                <img
                  src={profile?.avatar || "/default-avatar.jpg"}
                  className={`w-9 h-9 rounded-xl object-cover border-2 border-emerald-500/50 shadow-sm `}
                  alt="Menu"
                />
              </button>
            ):(<button
              className="px-4 py-2 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors"
              onClick={() => navigate("login")}
            >
              Login
            </button>)}

            
          </div>
        </div>
      </header>

      {/* DRAWER (Menú Lateral) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Overlay oscuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 lg:hidden"
            />

            {/* Panel del Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-neutral-950 z-110 shadow-2xl lg:hidden flex flex-col"
            >
              {/* Header del Drawer (Perfil) */}
              <div className="p-6 pt-10 bg-linear-to-b from-emerald-50/50 dark:from-emerald-500/5 to-transparent">
                <div className="flex justify-between items-start mb-4">
                  <img
                    src={profile?.avatar || "/default-avatar.jpg"}
                    className="w-16 h-16 rounded-2xl object-cover border-4 border-white dark:border-neutral-900 shadow-xl"
                  />
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                <h2 className="text-xl font-black dark:text-white truncate">
                  {profile?.full_name}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md uppercase">
                    {profile?.carrera || "Estudiante"}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 text-gray-500 text-[10px] font-bold rounded-md uppercase border border-gray-200 dark:border-neutral-700">
                    Ciclo {profile?.ciclo || "?"}
                  </span>
                </div>
              </div>

              {/* Rutas / Enlaces */}
              <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      navigate(item.path);
                      setIsDrawerOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-neutral-900 text-gray-700 dark:text-gray-300 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-50 dark:bg-neutral-800 rounded-xl group-hover:text-emerald-500 transition-colors">
                        {item.icon}
                      </div>
                      <span className="font-bold text-sm">{item.text}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                ))}
              </nav>

              {/* Logout al final */}
              <div className="p-4 border-t border-gray-100 dark:border-neutral-900">
                <button
                  onClick={() => {
                    signout();
                    setIsDrawerOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="text-sm">Cerrar Sesión</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default HeaderM;
