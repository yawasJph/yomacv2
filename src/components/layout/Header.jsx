import React from "react";
import Logo from "../ui/Logo";
import UserAvatar from "../ui/UserAvatar";
import ToggleThemeButton from "../ui/ToggleThemeButton";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, signinWithGoogle , signout} = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 dark:bg-black/10 backdrop-blur-lg border-b border-emerald-500/10 dark:border-emerald-500/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo + nombre */}
        <Logo />

        {/* Acciones del usuario */}
        <div className="flex items-center gap-4">
          {/* Botones de acción */}
          <div className="hidden sm:flex items-center gap-3">
            {/* <NotificationButton/>
                <MessageButton/> */}
          </div>
          {/* 🔹 Tema claro/oscuro */}
          <ToggleThemeButton />
          {/* 🔹 Avatar del Usuario  */}
          {user ? (
            <UserAvatar user={user} signout={signout} />
          ) : (
            <button
              className="px-4 py-2 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors"
              onClick={() => signinWithGoogle()}
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
