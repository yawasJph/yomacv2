import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { supabaseClient } from "../../supabase/supabaseClient";
import UserSearchCard from "../ui/UserSearchCard";
import ConnectionsSkeleton from "../skeletons/ConnectionsSkeleton";

const UserConnections = () => {
  const { userId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "followers";
  const [searchTerm, setSearchTerm] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // 1. Info del perfil con contadores (usando la vista que creamos)
        const { data: userData } = await supabaseClient
          .from("profiles_with_stats")
          .select("*")
          .eq("id", userId)
          .single();
        setTargetUser(userData);
        console.log(userData);

        // 2. Traer AMBAS listas en paralelo
        const [resFollowers, resFollowing] = await Promise.all([
          supabaseClient
            .from("followers")
            .select("follower_id")
            .eq("following_id", userId),
          supabaseClient
            .from("followers")
            .select("following_id")
            .eq("follower_id", userId),
        ]);

        const followerIds = resFollowers.data?.map((f) => f.follower_id) || [];
        const followingIds =
          resFollowing.data?.map((f) => f.following_id) || [];

        // 3. Obtener los perfiles completos de esos IDs
        const [profilesFollowers, profilesFollowing] = await Promise.all([
          followerIds.length > 0
            ? supabaseClient
                .from("profiles_with_stats")
                .select("*")
                .in("id", followerIds)
            : { data: [] },
          followingIds.length > 0
            ? supabaseClient
                .from("profiles_with_stats")
                .select("*")
                .in("id", followingIds)
            : { data: [] },
        ]);

        setFollowers(profilesFollowers.data || []);
        setFollowing(profilesFollowing.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userId]);

  // Decidimos qué lista mostrar según el tab activo
  const currentList = activeTab === "followers" ? followers : following;

  // Filtramos la lista activa (followers o following) basándonos en el searchTerm
  const filteredList = currentList.filter(
    (profile) =>
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.carrera?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header Estilo Twitter */}
      <div className="flex items-center gap-6 p-2 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold dark:text-white">
            {targetUser?.full_name}
          </h1>
          <div className="flex gap-1 items-center">
            {targetUser?.carrera && (
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                {targetUser.carrera}
              </span>
            )}
            {targetUser?.ciclo && (
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 font-bold border border-gray-200 dark:border-gray-700">
                Ciclo {targetUser.ciclo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 sticky top-[57px] bg-white dark:bg-black z-10">
        {[
          { id: "followers", label: "Seguidores" },
          { id: "following", label: "Siguiendo" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ tab: tab.id })}
            className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? "text-emerald-500 border-b-2 border-emerald-500"
                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
            }`}
          >
            {tab.label}
            {/* Badge del contador en el Tab */}
            {!loading && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {tab.id === "followers"
                  ? targetUser?.followers_count
                  : targetUser?.following_count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Buscador interno */}
      {!loading && currentList.length > 0 && (
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

      {/* LISTA */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {loading ? (
          <ConnectionsSkeleton />
        ) : filteredList.length > 0 ? (
          <div className="animate-in fade-in duration-300">
            {filteredList.map((profile) => (
              <UserSearchCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="p-20 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? `No se encontraron coincidencias para "${searchTerm}"`
                : "No hay nadie por aquí todavía."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-emerald-500 text-sm font-bold hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserConnections;
