import NavigationD from "../ui/NavigationD";
import StoreBannerWidget from "../ui/StoreBannerWidget";

const LeftSidebar = () => {
  return (
    // <aside className="hidden lg:flex lg:w-64 xl:w-80 flex-col h-[calc(100vh-64px)] sticky top-16 px-6 py-4">
       <aside className="hidden xl:flex flex-col w-80 sticky top-16 h-screen py-6 gap-5 overflow-y-auto no-scrollbar px-6 ">
      {/* Navegación */}
      <NavigationD />
      <StoreBannerWidget/>
      
      {/* Botón para descargar APK */}
      {/* <div className="mt-6 bg-white dark:bg-black border border-emerald-500/20 dark:border-emerald-500/30 rounded-xl p-4 text-center hover:border-emerald-500/40 dark:hover:border-emerald-500/50 transition-all duration-300">
        <h3 className="text-base font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
          Descarga la app móvil 📱
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Disponible para usuarios Android
        </p>
      </div> */}
    </aside>
  );
};

export default LeftSidebar;
