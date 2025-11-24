import React from "react";

const RigthSidebar = () => {
  return (
    <aside className="hidden xl:flex xl:w-80 flex-col h-[calc(100vh-64px)] sticky top-16 px-6 py-4 space-y-6">
      {/* Tendencias */}
      <div className="bg-white dark:bg-black rounded-xl border border-emerald-500/20 dark:border-emerald-500/30 p-4 hover:border-emerald-500/40 dark:hover:border-emerald-500/50 transition-all duration-300">
        <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-4 text-base">
          Tendencias
        </h3>
        <div className="space-y-2">
          {["#Tecnología", "#Diseño", "#Programación", "#Innovación"].map(
            (topic, index) => (
              <div
                key={index}
                className="flex justify-between items-center group cursor-pointer p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors duration-200"
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
  );
};

export default RigthSidebar;
