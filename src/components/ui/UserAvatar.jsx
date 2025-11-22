import { LogOut, UserPen } from "lucide-react";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const UserAvatar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <div className="relative">
          <img
            src={"/default-avatar.jpg"}
            alt="perfil"
            className="w-9 h-9 rounded-xl border-2 border-emerald-400/50 shadow-sm"
          />
          
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"></div>
        </div>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-600 overflow-hidden z-50 backdrop-blur-lg">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <p className="font-semibold text-gray-900 dark:text-white"></p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {/* @{user.user_metadata.full_name?.toLowerCase().replace(/\s+/g, "")} */}
              Joseph LLacuash Avila
            </p>
          </div>

          <div className="p-2">
            <NavLink
              to="profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
            >
              <UserPen size={18} /> Perfil
            </NavLink>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors mt-2 cursor-pointer">
              <LogOut size={18} /> Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
