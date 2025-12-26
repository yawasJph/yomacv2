import {
  Bookmark,
  Home,
  Plus,
  TriangleAlertIcon,
  UserPen,
  Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const NavigationD = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Definimos qué rutas requieren login
  const sidebarLinks = [
    {
      to: ".",
      icon: <Home size={22} />,
      text: "Inicio",
      end: true,
      private: false,
    },
    {
      to: `profile/${user?.id}`,
      icon: <UserPen size={22} />,
      text: "Perfil",
      private: true,
    },
    {
      to: "users",
      icon: <Users size={22} />,
      text: "Descubrir",
      private: false,
    }, // Público para que vean a otros
    {
      to: "save-posts",
      icon: <Bookmark size={22} />,
      text: "Guardados",
      private: true,
    },
  ];

  // Función genérica para mostrar el error y redirigir
  const requireAuth = (actionText = "realizar esta acción") => {
    navigate("login");
    toast.error(`Debes iniciar sesión para ${actionText}`, {
      className: "shadow-lg border-l-4 border-red-600",
      icon: <TriangleAlertIcon className="w-5 h-5 text-red-500" />,
    });
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
      toast.error("Debes iniciar sesión para crear una publicación", {
        className: "shadow-lg border-l-4 border-red-600",

        action: {
          label: "Ayuda",
          onClick: () => {
            console.log("Abriendo página de soporte...");
            toast.info("Abriendo centro de ayuda...");
          },
          className: "bg-white text-gray-800 hover:bg-gray-100 font-semibold",
        },
        icon: <TriangleAlertIcon className="w-5 h-5 text-red-500" />,
      });
    }
  };

  return (
    <nav className="flex flex-col gap-1">
      {sidebarLinks.map((l) => (
        <NavLink
          key={l.text}
          to={l.to} // Si es privado y no hay user, link muerto
          onClick={(e) => handleProtectedNavigation(e, l)}
          end={l.end}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              isActive
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-emerald-600 dark:hover:text-emerald-400"
            }`
          }
        >
          {l.icon} <span className="text-base">{l.text}</span>
        </NavLink>
      ))}

      <button
        className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold mt-4 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
        onClick={() => user ? navigate("create-post") : requireAuth("crear una publicación")}
      >
        <Plus size={25} />
        Crear Publicación
      </button>
    </nav>
  );
};

export default NavigationD;
