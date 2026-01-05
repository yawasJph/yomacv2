
import Logo from "../ui/Logo";
import UserAvatar from "../ui/UserAvatar";
import ToggleThemeButton from "../ui/ToggleThemeButton";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationIcon from "../ui/NotificationIcon";
import UserCredits from "../games/UserCredits";
import { use } from "react";

const Header = () => {
  const { user} = useAuth();
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 dark:bg-black/80 backdrop-blur-lg border-b border-emerald-500/10 dark:border-emerald-500/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo + nombre */}
        <Logo />

        {/* Acciones del usuario */}
        <div className="flex items-center gap-4 max-sm:gap-2">
          {/* Botones de acción */}
          <div className="hidden sm:flex items-center gap-3">
            {/* <NotificationButton/>
                <MessageButton/> */}
                
          </div>
          {/* 🔹 Tema claro/oscuro */}
          <NotificationIcon/>
          <ToggleThemeButton />
          {/* 🔹 Avatar del Usuario  */}
          {user ? (
            <>
            <UserAvatar/>
            <UserCredits userId={user?.id} />
            </>
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
  );
};

export default Header;
