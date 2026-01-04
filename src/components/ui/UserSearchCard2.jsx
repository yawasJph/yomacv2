import { useState } from "react";
import { UserPlus, UserCheck, UserMinus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import UserHoverCard from "./feed/UserHoverCard";
import { useFollow } from "../../context/FollowContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useQueryClient } from "@tanstack/react-query"; // 👈 Importamos QueryClient
import { useParams } from "react-router-dom"; // 👈 Para saber si estamos en un perfil

const UserSearchCard = ({ profile }) => {
  const { user: currentUser } = useAuth();
  const { userId: profileIdInParams } = useParams(); // ID del perfil que estamos viendo (si aplica)
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);
  const { isFollowing, followUser, unfollowUser } = useFollow();
  const [isHovered, setIsHovered] = useState(false);

  const isMobile = useIsMobile();
  const following = isFollowing(profile.id);

  const handleAction = async (e) => {
    e.stopPropagation();
    if (!currentUser || actionLoading) return;

    setActionLoading(true);
    try {
      if (following) {
        await unfollowUser(profile.id);
      } else {
        await followUser(profile.id);
      }

      // 🔥 SINCRONIZACIÓN DE CACHÉ 🔥
      
      // 1. Invalida sugerencias (para que se refresquen si estamos ahí)
      queryClient.invalidateQueries({ queryKey: ["user_suggestions", currentUser.id] });

      // 2. Si estamos viendo una lista de seguidores/seguidos, refrescarla
      if (profileIdInParams) {
        queryClient.invalidateQueries({ queryKey: ["connections", profileIdInParams] });
        queryClient.invalidateQueries({ queryKey: ["profile", profileIdInParams] });
      }

      // 3. Invalida el perfil específico del usuario al que acabamos de seguir/dejar de seguir
      queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });

    } catch (error) {
      console.error("Error en la acción de seguimiento:", error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <img
          src={profile.avatar || "/default-avatar.jpg"}
          alt={profile.full_name}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0 border border-emerald-500/10 cursor-pointer"
        />

        <div className="min-w-0 flex-1">
          <UserHoverCard user={profile}>
            <h4 className="font-bold text-gray-900 dark:text-white truncate hover:underline cursor-pointer decoration-emerald-500 text-sm sm:text-base">
              {profile.full_name}
            </h4>
          </UserHoverCard>
          <div className="flex gap-1 items-center">
            {profile.carrera && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                {profile.carrera}
              </span>
            )}
            {profile.ciclo && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 font-bold border border-gray-200 dark:border-gray-700">
                Ciclo {profile.ciclo}
              </span>
            )}
          </div>
          {profile.bio && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {currentUser?.id !== profile.id && (
        <button
          onClick={handleAction}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={actionLoading}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 min-w-[100px] sm:min-w-[120px] flex items-center justify-center gap-2 ${
            following
              ? isHovered
                ? "bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400" 
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          {actionLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : following ? (
            isHovered ? (
              <><UserMinus size={16} /> {!isMobile && "Dejar de seguir"}</>
            ) : (
              <><UserCheck size={16} /> {!isMobile && "Siguiendo"}</>
            )
          ) : (
            <><UserPlus size={16} /> {!isMobile && "Seguir"}</>
          )}
        </button>
      )}
    </div>
  );
};

export default UserSearchCard;