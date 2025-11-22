import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";

const HomeLayout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition duration-300">
      <Header />

      {/* 🔹 Layout Principal */}
      <div className="pt-16 flex max-w-7xl mx-auto">
        {/* Sidebar Izquierda */}

        <aside className="hidden lg:flex lg:w-80 flex-col h-[calc(100vh-64px)] sticky top-16 p-6">
          {/* Botón para descargar APK */}
          <LeftSidebar/>
          <div className="mt-6 bg-white dark:bg-black border-2 border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-5 shadow-sm shadow-emerald-500/10 dark:shadow-emerald-500/20 text-center hover:border-emerald-500/40 dark:hover:border-emerald-500/50 transition-all duration-300">
            <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
              Descarga la app móvil 📱
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Disponible para usuarios Android
            </p>
          </div>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 min-h-screen px-4 py-6 lg:px-6 max-w-2xl mx-auto bg-white dark:bg-black">
          <Outlet />
        </main>

        {/* Sidebar Derecha */}
        <aside className="hidden xl:flex xl:w-80 flex-col h-[calc(100vh-64px)] sticky top-16 p-6 space-y-6">
          {/* Personas sugeridas */}
          
          {/* Tendencias  */}
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm shadow-emerald-500/10 dark:shadow-emerald-500/20 border-2 border-emerald-500/20 dark:border-emerald-500/30 p-5 hover:border-emerald-500/40 dark:hover:border-emerald-500/50 transition-all duration-300">
            <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-4 text-lg">
              Tendencias
            </h3>
            <div className="space-y-3">
              {["#Tecnología", "#Diseño", "#Programación", "#Innovación"].map(
                (topic, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center group cursor-pointer p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors duration-200"
                  >
                    <span className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-medium transition-colors">
                      {topic}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {Math.floor(Math.random() * 1000)} posts
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* 🔹 Barra inferior móvil mejorada */}

      {/* 🔹 Botón de descarga visible solo en móvil */}
    </div>
  );
};

export default HomeLayout;
