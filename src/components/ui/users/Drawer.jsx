import { ChevronRight, LayoutDashboard, LogOut, ShieldCheck, X } from "lucide-react";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ToggleThemeButton from "../ToggleThemeButton";
import { optimizeMedia } from "@/cloudinary/optimizeMedia";

const Drawer = ({ onClose, profile, menuItems, signout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  return (
    <>
      {/* Overlay oscuro */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 lg:hidden"
      />

      {/* Panel del Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-neutral-950 z-110 shadow-2xl lg:hidden flex flex-col"
      >
        {/* 1. Header del Drawer - Estático arriba */}
        <div className="p-6 pt-10 bg-linear-to-b from-emerald-50/50 dark:from-emerald-500/5 to-transparent shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
               <img
                src={optimizeMedia(profile?.avatar,"image") || "/default-avatar.jpg"}
                className="w-16 h-16 rounded-2xl object-cover border-4 border-white dark:border-neutral-900 shadow-xl"
                loading="lazy"
                onContextMenu={e => e.preventDefault()}
                draggable={false}
              />
              {/* Badge de Admin si aplica */}
              {profile?.is_admin && (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-lg border-2 border-white dark:border-neutral-900 shadow-lg">
                  <ShieldCheck size={12} fill="currentColor" />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-6">
              <ToggleThemeButton />
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <h2 className="text-xl font-black dark:text-white truncate">
            {profile?.full_name}
          </h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md uppercase">
              {profile?.carrera || "Estudiante"}
            </span>
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 text-gray-500 text-[10px] font-bold rounded-md uppercase border border-gray-200 dark:border-neutral-700">
              Ciclo {profile?.ciclo || "?"}
            </span>
          </div>
        </div>

        {/* 2. Área de Navegación - SCROLLABLE */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {/* Gradiente superior (opcional, por si hay mucho scroll hacia arriba) */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-linear-to-b from-white dark:from-neutral-950 to-transparent z-10 pointer-events-none" />

          {/* ÁREA DE NAVEGACIÓN */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar pb-10">
            {/* --- SECCIÓN ADMIN (NUEVA) --- */}
            {profile?.is_admin && (
              <div className="mb-2">
                <p className="px-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">
                  Administración
                </p>
                <button
                  onClick={() => {
                    navigate("/admin/dashboard");
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                      <LayoutDashboard size={18} />
                    </div>
                    <span className="font-black text-sm">Admin Panel</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-neutral-900 text-gray-700 dark:text-gray-300 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 dark:bg-neutral-800 rounded-xl group-hover:text-emerald-500 transition-colors">
                    {item.icon}
                  </div>
                  <span className="font-bold text-sm">{item.text}</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
          </nav>

          {/* GRADIENTE INFERIOR - El indicador de "más contenido" */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-white dark:from-neutral-950 to-transparent z-10 pointer-events-none" />
        </div>

        {/* 3. Footer / Logout - Estático abajo */}
        <div className="p-4 border-t border-gray-100 dark:border-neutral-900 shrink-0 bg-white dark:bg-neutral-950">
          <button
            onClick={() => {
              signout();
              onClose();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Drawer;
