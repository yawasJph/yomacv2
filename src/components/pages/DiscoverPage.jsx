import { useState, useEffect } from "react";
import { Search, Filter, GraduationCap } from "lucide-react";
import { useDiscoverProfiles } from "../../hooks/useDiscoverProfiles";
import UserSearchCard from "../ui/UserSearchCard2";

const DiscoverPage = () => {
  const [activeTab, setActiveTab] = useState("TODOS");
  const [selectedCiclo, setSelectedCiclo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Manejo de Debounce para no saturar la API al escribir
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: profiles = [], isLoading } = useDiscoverProfiles({
    activeTab,
    selectedCiclo,
    searchTerm: debouncedSearch,
  });

  const tabs = [
    { id: "TODOS", label: "Todos" },
    { id: "D.S.I.", label: "D.S.I." },
    { id: "E.T.", label: "E.T." },
    { id: "I.A.B.", label: "I.A.B." },
  ];

  const ciclos = ["I", "II", "III", "IV", "V", "VI"];

  return (
    <div className="bg-white dark:bg-black">{/* min-h-screen */}
      {/* HEADER & BUSCADOR */}
      <div className="sticky top-[57px] z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 space-y-4 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar estudiantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border-transparent focus:bg-white dark:focus:bg-black border focus:border-emerald-500 rounded-2xl outline-none transition-all dark:text-white"
          />
        </div>

        {/* SELECT DE CICLO Y TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-800 text-emerald-500 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <select
              value={selectedCiclo}
              onChange={(e) => setSelectedCiclo(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-gray-100 dark:bg-gray-900 text-xs font-bold rounded-xl outline-none border border-transparent focus:border-emerald-500 dark:text-gray-300" 
            >
              <option value="">Todos los Ciclos</option>
              {ciclos.map((c) => (
                <option key={c} value={c}>Ciclo {c}</option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="p-2 pb-20">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
          </div>
        ) : profiles.length > 0 ? (
          <div className="grid grid-cols-1 divide-y divide-gray-50 dark:divide-gray-900">
            {profiles.map((profile) => (
              <UserSearchCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="p-20 text-center">
            <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron estudiantes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;