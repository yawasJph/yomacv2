import { NavLink } from "react-router-dom";
import TrendingTopics from "../ui/rigthSidebar/TrendingTopics";
import UserSuggestions from "../ui/rigthSidebar/UserSuggestions2";
//import UserSuggestions from "../ui/rigthSidebar/UserSuggestions";
import SearchBar from "../ui/SearchBar";
import { Users } from "lucide-react";

const RigthSidebar = () => {
  return (
    // <aside className="hidden xl:flex xl:w-80 flex-col h-[calc(100vh-64px)] sticky top-16 px-6 py-4 space-y-6 overflow-y-auto">
    <aside className="hidden xl:flex flex-col w-80 sticky top-16 h-screen py-6 gap-5 overflow-y-auto no-scrollbar px-6 ">
      <SearchBar />
      <TrendingTopics />
      <UserSuggestions />
      {/* Footer sencillo */}
      <footer className="px-2 text-[10px] text-gray-500 dark:text-gray-600 flex flex-wrap gap-x-3 gap-y-1 uppercase tracking-widest font-bold">
        <span>© 2025 YoMAC</span>
      </footer>
    </aside>
  );
};

export default RigthSidebar;
