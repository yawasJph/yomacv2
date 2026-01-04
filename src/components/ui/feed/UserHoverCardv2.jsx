import { useState, useEffect } from "react";
import {
  Code,
  Leaf,
  Stethoscope,
} from "lucide-react";
import { useFollow } from "../../../context/FollowContext";
import { useAuth } from "../../../context/AuthContext";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { Link, useNavigate } from "react-router-dom";
import { supabaseClient } from "../../../supabase/supabaseClient";
import { useAuthAction } from "../../../hooks/useAuthAction";

export default function UserHoverCard({ user, children }) {
  const [open, setOpen] = useState(false);
  const { isFollowing, followUser, unfollowUser } = useFollow();
  const { user: currentUser } = useAuth();
  const isMobile = useIsMobile();
  const [isHoveredBtn, setIsHoveredBtn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const navigate = useNavigate();
  const { executeAction } = useAuthAction();

  const following = isFollowing(user.id);
  const isMe = currentUser?.id === user.id;

  // Solo habilitamos el hover en Desktop
  if (isMobile && isMe) return <>{children}</>;

  const handleAction = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    if (following) {
      await unfollowUser(user.id);
    } else {
      await followUser(user.id);
    }
    setIsLoading(false);
  };

  const goToFollows = (tab) => {
    navigate(`/user/${user.id}/connections?tab=${tab}`);
  };


  useEffect(() => {
    const fectData = async () => {
      // 1. Obtener info del usuario dueño del perfil
      const { data: userData, error } = await supabaseClient
        .from("profiles_with_stats") // 👈 Usa la vista, no la tabla base
        .select("full_name, followers_count, following_count")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log(error);
        throw new Error(error.message);
      }
      setTargetUser(userData);
    };
    fectData();
  }, []);

  const handleFollowsCount = (tab) => {
    executeAction(() => {
      goToFollows(tab);
    }, "ver los seguidores/seguidos");
  };

  const handleLike = (e) => {
    executeAction(() => {
      handleAction(e);
    }, "seguir a este usuario");
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}

      {open && (
        <div
          className="
            absolute left-0 top-full z-9999 w-72
            bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl 
            border border-gray-100 dark:border-emerald-500/20
            shadow-2xl animate-in fade-in zoom-in duration-200
          "
        >
          {/* Header: Avatar y Botón */}
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
                {user?.carrera === "I.A.B." && (
                  <Leaf
                    size={18}
                    className="text-emerald-400 dark:text-emerald-500"
                  />
                )}
                {user?.carrera === "E.T." && (
                  <Stethoscope
                    size={18}
                    className="text-emerald-400 dark:text-emerald-500"
                  />
                )}
                {user?.carrera === "D.S.I." && (
                  <Code
                    size={18}
                    className="text-emerald-400 dark:text-emerald-500"
                  />
                )}
              </div>
            </div>

            {!isMe && (
              <button
                onClick={handleLike}
                onMouseEnter={() => setIsHoveredBtn(true)}
                onMouseLeave={() => setIsHoveredBtn(false)}
                disabled={isLoading}
                className={`relative px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 flex items-center justify-center min-h-9 min-w-[85px] ${
                  following
                    ? isHoveredBtn
                      ? "bg-red-50 text-red-600 border border-red-100 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400"
                      : "bg-gray-100 dark:bg-emerald-500/10 text-gray-800 dark:text-emerald-400 border border-transparent"
                    : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                } ${isLoading ? "cursor-not-allowed opacity-80" : ""}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <span>
                    {following
                      ? isHoveredBtn
                        ? "Dejar de seguir"
                        : "Siguiendo"
                      : "Seguir"}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Información */}
          <div className="space-y-1">
             <Link to={`/profile/${user.id}`}>
              <h2 className="text-lg font-extrabold leading-tight dark:text-white hover:text-emerald-500 transition-colors cursor-pointer">
              {user.full_name}
            </h2>
             </Link>
           
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              {user.carrera || "Estudiante"}
            </p>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="mt-3 text-gray-600 dark:text-gray-300 text-[14px] leading-normal line-clamp-3">
              {user.bio}
            </p>
          )}

          {/* Stats: Seguidores / Siguiendo */}
          <div className="mt-4 flex gap-4 text-sm">
            <div
              onClick={() => handleFollowsCount("following")}
              className="flex gap-1 hover:underline cursor-pointer"
            >
              <span className="font-bold dark:text-white">
                {targetUser?.following_count || 0}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Siguiendo
              </span>
            </div>
            <div
              onClick={() => handleFollowsCount("followers")}
              className="flex gap-1 hover:underline cursor-pointer"
            >
              <span className="font-bold dark:text-white">
                {targetUser?.followers_count || 0}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Seguidores
              </span>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
