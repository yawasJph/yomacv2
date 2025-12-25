import { useState } from "react";
import { UserPlus, UserCheck, UserMinus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import UserHoverCard from "./feed/UserHoverCard";
import { useFollow } from "../../context/FollowContext";
import { useIsMobile } from "../../hooks/useIsMobile";

const UserSearchCard = ({ profile }) => {
  const { user: currentUser } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const { isFollowing, followUser, unfollowUser } = useFollow();
  const [isHovered, setIsHovered] = useState(false);

  const isMobile = useIsMobile();
  const following = isFollowing(profile.id);

  const handleAction = async (e) => {
    e.stopPropagation();
    if (!currentUser || actionLoading) return;

    setActionLoading(true);
    if (following) {
      await unfollowUser(profile.id);
    } else {
      await followUser(profile.id);
    }
    setActionLoading(false);
  };

  //if (currentUser?.id === profile.id) return null;

  return (
    <div className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <UserHoverCard user={profile}>
          <img
            src={profile.avatar || "/default-avatar.jpg"}
            alt={profile.full_name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0 border border-emerald-500/10 cursor-pointer"
          />
        </UserHoverCard>

        <div className="min-w-0 flex-1">
          <UserHoverCard user={profile}>
            <h4 className="font-bold text-gray-900 dark:text-white truncate hover:underline cursor-pointer decoration-emerald-500 text-sm">
              {profile.full_name.length > 20
                ? profile.full_name.substring(0, 20) + "..."
                : profile.full_name}
            </h4>
          </UserHoverCard>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate">
            {profile.carrera || "Estudiante / Profesional"}
          </p>
          {profile.bio && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Botón de acción: No se muestra si es el perfil del propio usuario logueado */}
      {currentUser?.id !== profile.id && (
        <button
          onClick={handleAction}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={actionLoading}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 min-w-20 sm:min-w-[120px] flex items-center justify-center gap-2 ${
            following
              ? isHovered
                ? "bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30" // Estado Dejar de seguir
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" // Estado Siguiendo normal
              : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20" // Estado Seguir
          }`}
        >
          {actionLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : following ? (
            isHovered ? (
              <>
                {" "}
                 {isMobile ? (
                  <UserMinus size={16} />
                ) : (
                  <>
                    <UserMinus size={16} /> Dejar de seguir{" "}
                  </>
                )}
                
              </>
            ) : (
              <>
                {" "}
                {isMobile ? (
                  <UserMinus size={16} />
                ) : (
                  <>
                    <UserCheck size={16} /> Siguiendo{" "}
                  </>
                )}
              </>
            )
          ) : (
            <>
              {" "}
                {isMobile ? (
                  <UserPlus size={16} />
                ) : (
                  <>
                    <UserPlus size={16} /> Seguir{" "}
                  </>
                )}
              
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default UserSearchCard;
