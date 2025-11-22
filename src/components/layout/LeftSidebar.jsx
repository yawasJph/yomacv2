import { Bookmark, Home, UserPen, Users } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

const sidebarLinks = [
  { to: ".", icon: <Home size={22} />, text: "Inicio", end: true },
  { to: "profile", icon: <UserPen size={22} />, text: "Perfil" },
  { to: "users", icon: <Users size={22} />, text: "Descubrir" },
  { to: "save-posts", icon: <Bookmark size={22} />, text: "Guardados" },
];

const LeftSidebar = () => {
  return (
    <div>
      <nav className="flex flex-col gap-2">
        {sidebarLinks.map((l) => (
          <NavLink
            key={l.text}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? "bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
              }`
            }
          >
            {l.icon} {l.text}
          </NavLink>
        ))}

        {/* Donation Page*/}
        {/* <button
        className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold mt-4 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
        onClick={() => navigate("donation")}
      >
        <PiggyBank size={25} />
        Donacion
      </button> */}
      </nav>
    </div>
  );
};

export default LeftSidebar;
