import { Bookmark, Home, Plus, TriangleAlertIcon, UserPen, Users } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";



const NavigationD = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const sidebarLinks = [
  { to: ".", icon: <Home size={22} />, text: "Inicio", end: true },
  { to: `profile`, icon: <UserPen size={22} />, text: "Perfil" },
  { to: "users", icon: <Users size={22} />, text: "Descubrir" },
  { to: "save-posts", icon: <Bookmark size={22} />, text: "Guardados" },
];

console.log(user)

  const handleCreatePost = () => {
    if (user) {
      navigate("create-post");
    } else {
      navigate("login");
      toast.error("Debes iniciar sesión para crear una publicación", {
        // 📝 Descripción para dar más contexto
       
        
        // ⏳ Duración del toast (por ejemplo, 6 segundos)
        
      
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
            toast.info("Abriendo centro de ayuda...");
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
    <nav className="flex flex-col gap-1">
      {sidebarLinks.map((l) => (
        <NavLink
          key={l.text}
          to={l.to}
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
    className="flex items-center gap-4 px-4 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-400 text-white font-semibold mt-4 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
    onClick={handleCreatePost}
  >
    <Plus size={25} />
    Crear publicación
  </button> 
  </nav>
  )
}

export default NavigationD