import { useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../context/SearchContext";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { updateQuery } = useSearch();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Navegamos a la página de búsqueda con el parámetro q
    updateQuery(query.trim())
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar hilos o hashtags..."
        className="w-full bg-gray-100 dark:bg-gray-900 border border-transparent focus:border-emerald-500/50 focus:bg-white dark:focus:bg-black py-2.5 pl-10 pr-10 rounded-full text-sm outline-none transition-all placeholder:text-gray-500 dark:placeholder:text-white dark:text-white"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
};

export default SearchBar;