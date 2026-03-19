import { useState } from "react";
import {
  Bookmark,
  ShoppingBag,
  Search,
  Bot,
  MessageCircle,
  Trophy,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import UserCredits from "../games/UserCredits";
import Logo from "../ui/Logo";
import NotificationIcon from "../ui/NotificationIcon";
import Drawer from "../ui/users/Drawer";
import { optimizeMedia } from "@/cloudinary/optimizeMedia";
import { useSimpleProfile } from "@/hooks/user/useSimpleProfile";

const HeaderM = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, signout, loading } = useAuth();
  const { data: profile } = useSimpleProfile(user?.id);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <Bookmark size={20} />, text: "Guardados", path: "/savedPost" },
    {
      icon: <ShoppingBag size={20} />,
      text: "YoMAC Store",
      path: "/games/store",
    },
    {
      icon: <Bot size={20} />,
      text: "Yawas",
      path: "/yawas",
    },
    {
      icon: <Trophy size={22} />,
      text: "Ranking",
      path: "/games/leaderboard",
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

          {!loading && user && onViewCredits && (
            <UserCredits userId={user.id} />
          )}

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
            {!loading && user && <NotificationIcon />}
            {loading ? (
              // Skeleton o espacio vacío mientras valida la sesión
              <div className="skeleton w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-800 animate-pulse" />
            ) : user ? (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="ml-1 active:scale-90 transition-transform"
              >
                <img
                  src={
                    optimizeMedia(profile?.avatar, "image") ||
                    "/default-avatar.jpg"
                  }
                  className={`w-9 h-9 rounded-xl object-cover border-2 border-emerald-500/50 shadow-sm `}
                  alt="Menu"
                  loading="lazy"
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
