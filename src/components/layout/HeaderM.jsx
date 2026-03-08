import { useState } from "react";
import {
  X,
  Bookmark,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  Bot,
  BlocksIcon,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../hooks/useProfile";
import UserCredits from "../games/UserCredits";
import Logo from "../ui/Logo";
import NotificationIcon from "../ui/NotificationIcon";
import Drawer from "../ui/users/Drawer";

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
    {
      icon: <Bot size={20} />,
      text: "Yawas",
      path: "/yawas",
    },
    {
      icon: <BlocksIcon size={22} />,
      text: "Blog",
      path: "/blog",
    },
    {
      icon: <MessageCircle size={22} />,
      text: "Mensages",
      path: "/messages",
    },
  ];

  const onViewCredits = ["games"].some((route) =>
    location.pathname.includes(route),
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl z-40 border-b border-gray-100 dark:border-neutral-900 lg:hidden
        `}
      >
        <div className="flex items-center justify-between h-full px-4">
          {/* IZQUIERDA: Logo y Nombre */}
          <Logo />

          {user && onViewCredits && <UserCredits userId={user?.id} />}

          {!onViewCredits && (
            <div className="flex items-center gap-2">
              <button
                className="relative p-2 text-gray-600 dark:text-gray-400"
                onClick={() => navigate("search")}
              >
                <Search size={24} />
              </button>
            </div>
          )}

          {/* DERECHA: Notificaciones y Avatar */}
          <div className="flex items-center gap-2">
            {/* {!onViewCredits && <ToggleThemeButton />} */}
            {/* <ToggleThemeButton /> */}
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
            ) : (
              <button
                className="px-4 py-2 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors"
                onClick={() => navigate("login")}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* DRAWER (Menú Lateral) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <Drawer
            menuItems={menuItems}
            onClose={() => setIsDrawerOpen(false)}
            profile={profile}
            signout={signout}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default HeaderM;
