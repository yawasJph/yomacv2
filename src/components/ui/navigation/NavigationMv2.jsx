import {
  Home,
  Plus,
  Gamepad2,
  Users,
  User,
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom"; // 👈 1. Importar useLocation
import { notify } from "@/utils/toast/notifyv3";
import { useSimpleProfile } from "@/hooks/user/useSimpleProfile";
import { useAuth } from "@/context/AuthContext";

const NavigationM = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 2. Inicializar el hook
  const { user } = useAuth();
  const { data } = useSimpleProfile(user?.id);

  // Reducimos a los 4 pilares + Botón Central
  const links = [
    { to: ".", icon: <Home size={24} />, text: "Inicio", private: false },
    {
      to: "users",
      icon: <Users size={24} />,
      text: "Comunidad",
      private: false,
    },
    {
      to: "games",
      icon: <Gamepad2 size={24} />,
      text: "Juegos",
      private: false,
    },
    {
      // 👈 3. Evitar URL rara si no hay datos aún o no hay sesión
      to: data?.username ? `profile/@${data.username}` : "/profile",
      icon: <User size={24} />,
      text: "Perfil",
      private: true,
    },
  ];

  const requireAuth = (actionText = "realizar esta acción") => {
    navigate("login");
    notify.error(`Debes iniciar sesión para ${actionText}`);
  };

  // Manejador de clics para los enlaces
  const handleProtectedNavigation = (e, link) => {
    if (link.private && !user) {
      e.preventDefault(); // Evita que el NavLink cambie la ruta
      requireAuth(`ver tu ${link.text.toLowerCase()}`);
    }
  };

  const handleCreatePost = () => {
    if (user) {
      navigate("create-post");
    } else {
      navigate("login");
      notify.error("Debes iniciar sesión para crear una publicación");
    }
  };

  // 👈 4. Ahora location.pathname sí será reactivo cuando navegues por la app
  const onViewCredits = ["games", "yawas", "blog", "messages", "admin"].some(
    (route) => location.pathname.includes(route)
  );

  return (
    <div
      className={`fixed -bottom-1 left-0 right-0 z-90 lg:hidden ${
        onViewCredits ? "hidden" : ""
      }`}
    >
      {/* Efecto de degradado de fondo para que no corte el contenido bruscamente */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-black/20 dark:from-black/40 to-transparent pointer-events-none" />

      <nav className="relative mx-4 mb-4 bg-white/80 dark:bg-neutral-900/90 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-visible">
        <div className="flex items-center justify-between h-16 px-2">
          {/* Primeros dos iconos */}
          <div className="flex flex-1 justify-around">
            {links.slice(0, 2).map((link, index) => (
              <NavLink
                key={`${link.text}-${index}`}
                to={link.to}
                onClick={(e) => handleProtectedNavigation(e, link)}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center transition-all ${
                    isActive && link.to !== "#"
                      ? "text-emerald-500 scale-110"
                      : "text-gray-400"
                  }`
                }
              >
                {link.icon}
                <span className="text-[10px] font-bold mt-0.5">
                  {link.text}
                </span>
              </NavLink>
            ))}
          </div>

          {/* Botón Central Flotante */}
          <div className="relative">
            <button
              onClick={handleCreatePost}
              className="p-2 bg-linear-to-tr from-emerald-500 to-teal-400 text-white rounded-2xl shadow-lg shadow-emerald-500/40 active:scale-90 transition-transform border-4 border-white dark:border-neutral-900"
            >
              <Plus size={28} strokeWidth={3} />
            </button>
          </div>

          {/* Últimos dos iconos */}
          <div className="flex flex-1 justify-around">
            {links.slice(2, 4).map((link, index) => (
              <NavLink
                key={`${link.text}-${index}`}
                to={link.to}
                onClick={(e) => handleProtectedNavigation(e, link)}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center transition-all ${
                    isActive && link.to !== "#"
                      ? "text-emerald-500 scale-110"
                      : "text-gray-400"
                  }`
                }
              >
                {link.icon}
                <span className="text-[10px] font-bold mt-0.5">
                  {link.text}
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavigationM;