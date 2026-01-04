import { useState } from "react";
import { Code, Leaf, Stethoscope } from "lucide-react";
import { useFollow } from "../../../context/FollowContext";
import { useAuth } from "../../../context/AuthContext";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { Link, useNavigate } from "react-router-dom";
import { useAuthAction } from "../../../hooks/useAuthAction";
import { useProfile } from "../../../hooks/useProfile"; // 👈 Importamos tu hook de caché
import { useQueryClient } from "@tanstack/react-query";

export default function UserHoverCard({ user, children }) {
  const [open, setOpen] = useState(false);
  const { isFollowing, followUser, unfollowUser } = useFollow();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [isHoveredBtn, setIsHoveredBtn] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const navigate = useNavigate();
  const { executeAction } = useAuthAction();

  // 🔄 Usamos el hook con caché en lugar de useEffect + fetch manual
  // Solo se activa si el card está abierto para no saturar de peticiones al hacer scroll
  const { data: targetUser } = useProfile(open ? user.id : null);

  const following = isFollowing(user.id);
  const isMe = currentUser?.id === user.id;

  if (isMobile && isMe) return <>{children}</>;

  const handleAction = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoadingAction(true);
    try {
      if (following) {
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }
      
      // 🔥 Sincronización: Invalidamos para que los contadores del hover card y perfil se actualicen
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      queryClient.invalidateQueries({ queryKey: ["user_suggestions", currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["connections", user.id] });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const goToFollows = (tab) => {
    navigate(`/user/${user.id}/connections?tab=${tab}`);
  };

  const handleFollowsCount = (tab) => {
    executeAction(() => goToFollows(tab), "ver los seguidores/seguidos");
  };

  const handleFollowClick = (e) => {
    executeAction(() => handleAction(e), "seguir a este usuario");
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}

      {open && (
        <div className="absolute left-0 top-full z-9999 w-72 bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-gray-100 dark:border-emerald-500/20 shadow-2xl animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="relative">
              <Link to={`/profile/${user.id}`}>
                <img
                  src={user.avatar || "/default-avatar.jpg"}
                  alt={user.full_name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/10 shrink-0"
                />
              </Link>
              
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-700">
                {user?.carrera === "I.A.B." && <Leaf size={16} className="text-emerald-500" />}
                {user?.carrera === "E.T." && <Stethoscope size={16} className="text-emerald-500" />}
                {user?.carrera === "D.S.I." && <Code size={16} className="text-emerald-500" />}
              </div>
            </div>

            {!isMe && (
              <button
                onClick={handleFollowClick}
                onMouseEnter={() => setIsHoveredBtn(true)}
                onMouseLeave={() => setIsHoveredBtn(false)}
                disabled={isLoadingAction}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all min-h-9 min-w-[100px] flex items-center justify-center ${
                  following
                    ? isHoveredBtn
                      ? "bg-red-50 text-red-600 border border-red-100 dark:bg-red-500/10 dark:text-red-400"
                      : "bg-gray-100 dark:bg-emerald-500/10 text-gray-800 dark:text-emerald-400"
                    : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                }`}
              >
                {isLoadingAction ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  following ? (isHoveredBtn ? "Dejar de seguir" : "Siguiendo") : "Seguir"
                )}
              </button>
            )}
          </div>

          {/* Información */}
          <div className="space-y-1">
            <Link to={`/profile/${user.id}`}>
              <h2 className="text-lg font-extrabold leading-tight dark:text-white hover:text-emerald-500 transition-colors">
                {user.full_name}
              </h2>
            </Link>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              {user.carrera || "Estudiante"}
            </p>
          </div>

          {user.bio && (
            <p className="mt-3 text-gray-600 dark:text-gray-300 text-[14px] leading-snug line-clamp-3">
              {user.bio}
            </p>
          )}

          {/* Stats con datos de la CACHÉ */}
          <div className="mt-4 flex gap-4 text-sm border-t border-gray-100 dark:border-gray-800 pt-3">
            <button
              onClick={() => handleFollowsCount("following")}
              className="flex gap-1 hover:underline group"
            >
              <span className="font-bold dark:text-white group-hover:text-emerald-500">
                {targetUser?.following_count ?? '...'}
              </span>
              <span className="text-gray-500 dark:text-gray-400">Siguiendo</span>
            </button>
            <button
              onClick={() => handleFollowsCount("followers")}
              className="flex gap-1 hover:underline group"
            >
              <span className="font-bold dark:text-white group-hover:text-emerald-500">
                {targetUser?.followers_count ?? '...'}
              </span>
              <span className="text-gray-500 dark:text-gray-400">Seguidores</span>
            </button>
          </div>
        </div>
      )}
    </span>
  );
}