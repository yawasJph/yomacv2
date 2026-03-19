import Logo from "../ui/Logo";
import UserAvatar from "../ui/UserAvatar";
import ToggleThemeButton from "../ui/ToggleThemeButton";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom"; // Importamos useLocation
import NotificationIcon from "../ui/NotificationIcon";
import UserCredits from "../games/UserCredits";

const Header = () => {
  const { user, loading } = useAuth(); // 🔹 Traemos loading
  const navigate = useNavigate();
  const location = useLocation(); // 🔹 Hook para detectar ruta actual

  const onViewCredits = ["games"].some((route) =>
    location.pathname.includes(route)
  );

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 dark:bg-black/80 backdrop-blur-lg border-b border-emerald-500/10 dark:border-emerald-500/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Logo />

        {/* 🔹 Solo mostrar créditos si no está cargando y hay usuario */}
        {!loading && user && onViewCredits && <UserCredits userId={user.id} />}

        <div className="flex items-center gap-4 max-sm:gap-2">
          {/* 🔹 Solo mostrar notificaciones si no está cargando y hay usuario */}
          {!loading && user && <NotificationIcon />}
          
          <ToggleThemeButton />

          {/* 🔹 Lógica de Avatar vs Login con Loading State */}
          {loading ? (
            // Skeleton o espacio vacío mientras valida la sesión
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-800 animate-pulse" />
          ) : user ? (
            <UserAvatar />
          ) : (
            <button
              className="px-4 py-2 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors font-bold text-sm"
              onClick={() => navigate("login")}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;