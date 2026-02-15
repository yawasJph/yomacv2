import React, { memo, useMemo, useCallback } from "react";
import { UserPlus, UserCheck, UserMinus } from "lucide-react";
import { useFollow } from "@/context/FollowContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAuthAction } from "@/hooks/useAuthAction";

const UserSearchCard = ({ profile }) => {
  const { user: currentUser } = useAuth();
  const { isFollowing, followUser, unfollowUser } = useFollow();
  const { executeAction } = useAuthAction();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { userId: profileIdInParams } = useParams();

  const isMe = currentUser?.id === profile.id;

  // ⭐ Memo: evita recalcular en cada render
  const following = useMemo(
    () => isFollowing(profile.id),
    [isFollowing, profile.id]
  );

  // ⭐ Optimistic Follow Handler
  const handleAction = useCallback(async () => {
    if (!currentUser) return;

    const wasFollowing = following;

    // 🔥 OPTIMISTIC UPDATE
    queryClient.setQueryData(["profile", profile.id], (old) => {
      if (!old) return old;
      return {
        ...old,
        followers_count: old.followers_count + (wasFollowing ? -1 : 1),
      };
    });

    try {
      if (wasFollowing) {
        await unfollowUser(profile.id);
      } else {
        await followUser(profile.id);
      }

      // Sync queries silently
      queryClient.invalidateQueries({
        queryKey: ["user_suggestions", currentUser.id],
      });

      if (profileIdInParams) {
        queryClient.invalidateQueries({
          queryKey: ["connections", profileIdInParams],
        });
      }
    } catch {
      // rollback optimistic
      queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
    }
  }, [
    following,
    followUser,
    unfollowUser,
    currentUser,
    profile.id,
    profileIdInParams,
    queryClient,
  ]);

  const handleFollowClick = useCallback(
    (e) => {
      e.stopPropagation();
      executeAction(handleAction, "para seguir usuarios");
    },
    [executeAction, handleAction]
  );

  const renderLink = useCallback(
    (children) =>
      isMe ? children : <Link to={`/profile/${profile.id}`}>{children}</Link>,
    [isMe, profile.id]
  );

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-100 dark:border-gray-800 transition-all hover:bg-gray-50/70 dark:hover:bg-gray-900/30 hover:shadow-sm">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {renderLink(
          <img
            src={profile.avatar || "/default-avatar.jpg"}
            alt={profile.full_name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-emerald-500/10 bg-gray-200 dark:bg-gray-700 transition-transform hover:scale-105"
          />
        )}

        <div className="min-w-0 flex-1">
          {renderLink(
            <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm sm:text-base hover:underline decoration-emerald-500">
              {profile.full_name}
            </h4>
          )}

          {/* BADGES */}
          {!!profile.equipped_badges?.length && (
            <div className="flex items-center gap-0.5 mt-0.5">
              {profile.equipped_badges.slice(0, 3).map((item, idx) => (
                <span key={idx} className="text-[14px] select-none">
                  {item.badges?.icon || item.icon}
                </span>
              ))}
              {profile.equipped_badges.length > 3 && (
                <span className="text-[10px] font-black text-gray-400">
                  +{profile.equipped_badges.length - 3}
                </span>
              )}
            </div>
          )}

          {/* TAGS */}
          <div className="flex gap-1 mt-1">
            {profile.carrera && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                {profile.carrera}
              </span>
            )}
            {profile.ciclo && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 font-bold border border-gray-200 dark:border-gray-700">
                Ciclo {profile.ciclo}
              </span>
            )}
          </div>

          {profile.bio && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* FOLLOW BUTTON */}
      {!isMe && (
        <button
          onClick={handleFollowClick}
          className={`group shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-2
            ${
              following
                ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
        >
          {following ? (
            <>
              <UserCheck size={16} className="group-hover:hidden" />
              <UserMinus size={16} className="hidden group-hover:block" />
              {!isMobile && (
                <>
                  <span className="group-hover:hidden">Siguiendo</span>
                  <span className="hidden group-hover:inline">
                    Dejar de seguir
                  </span>
                </>
              )}
            </>
          ) : (
            <>
              <UserPlus size={16} />
              {!isMobile && "Seguir"}
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default memo(UserSearchCard);
