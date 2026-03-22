import {
  Bookmark,
  Bot,
  Gamepad2,
  Home,
  MessageSquarePlus,
  Plus,
  UserPen,
  Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { notify } from "@/utils/toast/notifyv3";
import { useSimpleProfile } from "@/hooks/user/useSimpleProfile";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const NavigationD = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data } = useSimpleProfile(user?.id);
  const [collapsed, setCollapsed] = useState(false);

  const requireAuth = (actionText = "realizar esta acción") => {
    navigate("login");
    notify.error(`Debes iniciar sesión para ${actionText}`);
  };

  const sidebarLinks = [
    {
      to: "/",
      icon: <Home size={22} />,
      text: "Inicio",
      end: true,
    },
    {
      to: data?.username ? `/profile/@${data.username}` : null,
      icon: <UserPen size={22} />,
      text: "Perfil",
      private: true,
    },
    {
      to: "/users",
      icon: <Users size={22} />,
      text: "Descubrir",
    },
    {
      to: "/savedPost",
      icon: <Bookmark size={22} />,
      text: "Guardados",
      private: true,
    },
    {
      to: "/games",
      icon: <Gamepad2 size={22} />,
      text: "Juegos",
    },
    {
      to: "/yawas",
      icon: <Bot size={22} />,
      text: "Yawas",
      private: true,
    },
    {
      to: "/messages",
      icon: <MessageSquarePlus size={22} />,
      text: "Mensajes",
    },
  ];

  const handleProtectedNavigation = (e, link) => {
    if (link.private && !user) {
      e.preventDefault();
      requireAuth(`ver ${link.text.toLowerCase()}`);
    }
  };

  return (
    <aside
      className={`flex flex-col transition-all duration-300 gap-2 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* NAV */}
      <nav className="flex flex-col gap-1 relative">
        {sidebarLinks.map((l) => {
          if (!l.to) return null;

          return (
            <NavLink
              key={l.text}
              to={l.to}
              end={l.end}
              onClick={(e) => handleProtectedNavigation(e, l)}
              className={({ isActive }) =>
                `group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-emerald-500"
                }`
              }
            >
              {/* 🔥 Barra activa animada */}
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-emerald-500 transition-all duration-300 ${
                  ({ isActive }) => (isActive ? "opacity-100" : "opacity-0")
                }`}
              />

              {/* ICON */}
              <div className="relative">
                {l.icon}

                {/* Tooltip cuando está colapsado */}
                {collapsed && (
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition">
                    {l.text}
                  </span>
                )}
              </div>

              {/* TEXT */}
              {!collapsed && (
                <span className="text-base">{l.text}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* BOTONES */}
      <div className="space-y-3 px-2">
        {/* Crear */}
        <button
          onClick={() =>
            user
              ? navigate("create-post")
              : requireAuth("crear una publicación")
          }
          className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-400 text-white font-semibold hover:scale-105 transition-all shadow-md"
        >
          <Plus size={22} />
          {!collapsed && "Crear Publicación"}
        </button>

        {/* Toggle collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-2 text-xs text-gray-500 hover:text-emerald-500 transition"
        >
          {collapsed ? "Expandir" : "Colapsar"}
        </button>
      </div>
    </aside>
  );
};

export default NavigationD;