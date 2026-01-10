import { LogOut, Settings, UserPen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../hooks/useProfile";

const UserAvatar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signout } = useAuth();
  const { data: profile } = useProfile(user.id);
  const optionsRef = useRef(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={optionsRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <div className="relative">
          <img
            src={profile?.avatar || "/default-avatar.jpg"}
            alt={user.user_metadata.full_name}
            className="w-9 h-9 rounded-xl border-2 border-emerald-400/50 shadow-sm"
          />

          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"></div>
        </div>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-neutral-900 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-600 overflow-hidden z-50 backdrop-blur-lg">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <p className="text-base font-bold text-gray-900 dark:text-gray-100 ">
              {/**truncate */}
              {/* {profile.full_name.length > 20
                ? profile.full_name.substring(0, 20) + "..."
                : profile.full_name}  */}
              {profile.full_name}
              {/* RENDERIZADO DE INSIGNIAS EN EL FEED (LIMITADO A 3) */}
              <span className="flex items-center gap-0.5 ml-1 shrink-0">
                {profile.equipped_badges?.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[14px] sm:text-[16px] select-none"
                    title={item.badges?.name || item.name}
                  >
                    {item.badges?.icon || item.icon}
                  </span>
                ))}
                {profile.equipped_badges?.length > 3 && (
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 ml-0.5">
                    +{profile.equipped_badges.length - 3}
                  </span>
                )}
              </span>
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                {profile?.carrera || "Estudiante"}
              </span>
              {profile?.ciclo && (
                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                  Ciclo {profile.ciclo}
                </span>
              )}
            </div>
          </div>

          <div className="p-2">
            <NavLink
              to={`/profile/${user.id}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
            >
              <UserPen size={18} /> Perfil
            </NavLink>

            <button
              onClick={signout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors mt-2 cursor-pointer"
            >
              <LogOut size={18} /> Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
