import React, { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { supabaseClient } from "../../../supabase/supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import SuggestionSkeleton from "../../skeletons/SuggestionSkeleton";

const UserSuggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

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
        // Añadimos un pequeño delay artificial de 500ms para evitar parpadeos bruscos
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchSuggestions();
  }, [user]);

  const handleFollow = async (targetId) => {
    try {
      const { error } = await supabaseClient.from("followers").insert({
        follower_id: user.id,
        following_id: targetId,
      });

      if (error) throw error;
      setSuggestions((prev) => prev.filter((s) => s.id !== targetId));
    } catch (error) {
      console.error("Error al seguir:", error.message);
    }
  };

  // Si no hay sugerencias y terminó de cargar, no mostramos el cuadro
  if (!loading && suggestions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-black rounded-xl border border-emerald-500/20 dark:border-emerald-500/30 p-4 hover:border-emerald-500/40 dark:hover:border-emerald-500/50 transition-all duration-300">
      <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-4 text-base">
        A quién seguir
      </h3>

      <div className="space-y-4">
        {loading ? (
          // Mostramos 3 esqueletos mientras carga
          <>
            <SuggestionSkeleton />
            <SuggestionSkeleton />
            <SuggestionSkeleton />
          </>
        ) : (
          suggestions.map((profile) => (
           <div className="flex items-center justify-between gap-3 group">
  <div className="flex items-center gap-2 min-w-0 flex-1">
    <img
      src={profile.avatar || "/default-avatar.jpg"}
      alt={profile.full_name}
      className="w-10 h-10 rounded-full object-cover shrink-0 border border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors"
    />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
        {profile.full_name.length > 20 
          ? profile.full_name.substring(0, 20) + '...'
          : profile.full_name}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
        {profile.carrera || "Usuario"}
      </p>
    </div>
  </div>
  <button
    onClick={() => handleFollow(profile.id)}
    className="shrink-0 p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 transition-all duration-200"
    title={`Seguir a ${profile.full_name}`}
  >
    <UserPlus size={16} />
  </button>
</div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserSuggestions;
