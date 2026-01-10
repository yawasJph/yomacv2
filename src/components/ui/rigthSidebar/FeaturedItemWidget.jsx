import React from "react";
import { NavLink } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

const FeaturedItemWidget = ({ featuredItem, userProfile }) => {
  if (!featuredItem) return null;

  const isWrongCarrera =
    featuredItem.carrera_restriccion &&
    featuredItem.carrera_restriccion !== userProfile?.carrera;

  return (
    <div className="relative group overflow-hidden bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-6 rounded-[2.5rem] shadow-sm transition-all hover:shadow-xl hover:shadow-emerald-500/10">
      {/* Fondo Decorativo Brillante */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-colors" />

      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-amber-100 dark:bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400">
          <Sparkles size={16} strokeWidth={3} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Oferta del día
        </span>
      </div>

      <div className="flex flex-col items-center text-center">
        {/* Visualización del Item */}
        <div className="mb-4 relative">
          {featuredItem.category === "badge" ? (
            <span className="text-6xl drop-shadow-md group-hover:scale-110 transition-transform duration-500 block">
              {featuredItem.icon}
            </span>
          ) : (
            <img
              src={featuredItem.resource_url}
              className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-500"
              alt="Featured"
            />
          )}
        </div>

        <h4 className="font-bold text-gray-900 dark:text-white mb-1">
          {featuredItem.name}
        </h4>

        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl font-black text-emerald-500">
            {featuredItem.price} CC
          </span>
          {featuredItem.carrera_restriccion && (
            <span className="text-[9px] font-bold bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-gray-500">
              Solo {featuredItem.carrera_restriccion}
            </span>
          )}
        </div>

        <NavLink
          to="/games/store"
          className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-wider transition-all ${
            isWrongCarrera
              ? "bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed"
              : "bg-gray-900 dark:bg-white text-white dark:text-black hover:gap-3"
          }`}
        >
          {isWrongCarrera ? "No disponible" : "Ir a la tienda"}
          {!isWrongCarrera && <ArrowRight size={14} />}
        </NavLink>
      </div>
    </div>
  );
};

export default FeaturedItemWidget;
