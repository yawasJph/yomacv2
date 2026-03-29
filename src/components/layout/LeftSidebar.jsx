
import NavigationD from "../ui/NavigationD";
import StoreBannerWidget from "../ui/StoreBannerWidget";

const LeftSidebar = () => {
  return (
    // <aside className="hidden lg:flex lg:w-64 xl:w-80 flex-col h-[calc(100vh-64px)] sticky top-16 px-6 py-4">
       <aside className="hidden xl:flex flex-col w-80 sticky top-16 h-screen py-6 gap-5 overflow-y-auto no-scrollbar px-6 ">
      {/* Navegación */}
      <NavigationD />
      <StoreBannerWidget/>
    </aside>
  );
};

export default LeftSidebar;
