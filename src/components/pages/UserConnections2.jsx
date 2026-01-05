import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { useProfile } from "../../hooks/useProfile"; // Tu hook
import { useConnections } from "../../hooks/useConnections";
//import UserSearchCard from "../ui/UserSearchCard";
import ConnectionsSkeleton from "../skeletons/ConnectionsSkeleton";
import UserSearchCard from "../ui/UserSearchCard2";

const UserConnections = () => {
  const { userId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "followers";
  const [searchTerm, setSearchTerm] = useState("");

  // Usamos los hooks con caché
  const { data: targetUser, isLoading: loadingProfile } = useProfile(userId);
  const { data: connections, isLoading: loadingConnections } = useConnections(userId);

  const isLoading = loadingProfile || loadingConnections;

  // Decidimos qué lista mostrar desde el objeto de conexiones en caché
  const currentList = activeTab === "followers" 
    ? (connections?.followers || []) 
    : (connections?.following || []);

  const filteredList = currentList.filter(
    (profile) =>
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.carrera?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-black">{/* min-h-screen */}
      {/* Header */}
      <div className="flex items-center gap-6 p-2 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full">
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold dark:text-white truncate max-w-[200px]">
            {targetUser?.full_name}
          </h1>
          <p className="text-xs text-gray-500 font-medium">@{targetUser?.full_name?.replace(/\s+/g, '').toLowerCase()}</p>
        </div>
      </div>

      {/* TABS con contadores reales del perfil en caché */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 sticky top-[57px] bg-white dark:bg-black z-10">
        {[
          { id: "followers", label: "Seguidores", count: targetUser?.followers_count },
          { id: "following", label: "Siguiendo", count: targetUser?.following_count },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ tab: tab.id })}
            className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id ? "text-emerald-500 border-b-2 border-emerald-500" : "text-gray-500"
            }`}
          >
            {tab.label}
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
              {tab.count || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Buscador e Input */}
      {!isLoading && currentList.length > 0 && (
        <div className="p-3 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 sticky top-[115px] z-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search
                size={16}
                className="text-gray-400 group-focus-within:text-emerald-500 transition-colors"
              />
            </div>
            <input
              type="text"
              placeholder={`Buscar en ${
                activeTab === "followers" ? "seguidores" : "siguiendo"
              }...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/50 dark:text-white transition-all outline-none"
            />
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {isLoading ? (
          <ConnectionsSkeleton />
        ) : filteredList.length > 0 ? (
          <div className="animate-in fade-in duration-500">
            {filteredList.map((profile) => (
              <UserSearchCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="p-20 text-center text-gray-500">
            {searchTerm ? "No hay resultados" : "Lista vacía"}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserConnections