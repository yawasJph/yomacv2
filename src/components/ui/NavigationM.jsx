import { Bookmark, Gamepad2, Home, Plus, TriangleAlertIcon, UserPen, Users } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

const NavigationM = () => {
  const navigate = useNavigate();
  const {user} = useAuth()

  const mobileNavLinks = [
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
    },
    {
      to: "savedPost",
      icon: <Bookmark size={22} />,
      text: "Guardados",
      private: true,
    },
    {
      to: "/games",
      icon: <Gamepad2 size={22} />,
      text: "Juegos",
      private: false,
    },
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
            toast.info("Ingresa con tu correo institucional del MAC", {
              icon: <Info className="w-5 h-5 text-indigo-300" />,
            });
            // window.open('https://tudominio.com/ayuda', '_blank');
          },
          // Opcional: Clases CSS para el botón de acción
          className: "bg-white text-gray-800 hover:bg-gray-100 font-semibold",
        },

        // 🖼️ Opcional: Icono personalizado (si no te gusta el predeterminado)
        icon: <TriangleAlertIcon className="w-5 h-5 text-red-500" />, // Asegúrate de importar el icono
      });
    }
  };

  return (
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
          onClick={handleCreatePost}
          className="p-3 bg-linear-to-r from-emerald-500 to-teal-400 text-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer font-semibold  hover:scale-105"
        >
          <Plus size={22} />
        </button>
      </div>
    </nav>
  );
};

export default NavigationM;
