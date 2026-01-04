import { useEffect, useState } from "react";
import { UserPlus, UserMinus } from "lucide-react"; // Añadimos iconos
import { supabaseClient } from "../../../supabase/supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import { useFollow } from "../../../context/FollowContext"; // 👈 Importamos el contexto
import SuggestionSkeleton from "../../skeletons/SuggestionSkeleton";

const UserSuggestions = () => {
  const { user } = useAuth();
  const { isFollowing, followUser, unfollowUser } = useFollow(); // 👈 Hooks del contexto
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // Para mostrar carga en un botón específico

  useEffect(() => {
    if (!user) return;

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabaseClient.rpc(
          "get_user_suggestions",
          {
            p_user_id: user.id,
            p_limit: 3,
          }
        );

        if (error) throw error;
        setSuggestions(data);
      } catch (error) {
        console.error("Error en sugerencias:", error.message);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchSuggestions();
  }, [user]);

  const handleToggleFollow = async (targetId) => {
    if (actionId) return; // Evitar múltiples clics
    setActionId(targetId);

    if (isFollowing(targetId)) {
      await unfollowUser(targetId);
    } else {
      await followUser(targetId);
    }

    setActionId(null);
  };

  if (!loading && suggestions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-black rounded-xl border border-emerald-500/20 dark:border-emerald-500/30 p-4 hover:border-emerald-500/40 dark:hover:border-emerald-500/50 transition-all duration-300">
      <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-4 text-base">
        A quién seguir
      </h3>

      <div className="space-y-4">
        {loading ? (
          <>
            <SuggestionSkeleton />
            <SuggestionSkeleton />
            <SuggestionSkeleton />
          </>
        ) : (
          suggestions.map((profile) => {
            const following = isFollowing(profile.id); // 👈 Estado dinámico

            return (
              <div
                className="flex items-center justify-between gap-3 group"
                key={profile.id}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <img
                    src={profile.avatar || "/default-avatar.jpg"}
                    alt={profile.full_name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                      {profile.full_name.length > 20
                        ? profile.full_name.substring(0, 20) + "..."
                        : profile.full_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {profile?.carrera || "Estudiante"}
                      </span>
                      {profile?.ciclo && (
                        <span className="text-gray-500 dark:text-gray-400 text-xs font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                          Ciclo {profile.ciclo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFollow(profile.id)}
                  disabled={actionId === profile.id}
                  className={`shrink-0 p-2 rounded-full transition-all duration-200 ${
                    following
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                      : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500"
                  }`}
                  title={following ? "Dejar de seguir" : "Seguir"}
                >
                  {actionId === profile.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : following ? (
                    <UserMinus
                      size={16}
                      className="animate-in zoom-in duration-300"
                    />
                  ) : (
                    <UserPlus
                      size={16}
                      className="animate-in zoom-in duration-300"
                    />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserSuggestions;
