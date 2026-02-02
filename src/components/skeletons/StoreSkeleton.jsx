import React from "react";

const StoreSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div 
          key={i}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 p-5 rounded-[2.5rem] flex flex-col items-center animate-pulse"
        >
          {/* Círculo del Icono/Imagen */}
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full mb-4" />
          
          {/* Título del ítem */}
          <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
          
          {/* Precio */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-10 bg-emerald-200 dark:bg-emerald-900/30 rounded-lg" />
            <div className="h-3 w-8 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          </div>

          {/* Botón */}
          <div className="w-full h-11 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        </div>
      ))}
    </div>
  );
};

export default StoreSkeleton;