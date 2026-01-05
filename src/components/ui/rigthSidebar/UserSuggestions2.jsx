import React, { useState } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useFollow } from "../../../context/FollowContext";
import { useUserSuggestions } from "../../../hooks/useUserSuggestions";
import { useQueryClient } from "@tanstack/react-query";
import SuggestionSkeleton from "../../skeletons/SuggestionSkeleton";
import { Link } from "react-router-dom";

const UserSuggestions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { isFollowing, followUser, unfollowUser } = useFollow();
  const { data: suggestions, isLoading } = useUserSuggestions(user?.id);
  const [actionId, setActionId] = useState(null);

  const handleToggleFollow = async (targetId) => {
    if (actionId) return;
    setActionId(targetId);

    try {
      if (isFollowing(targetId)) {
        await unfollowUser(targetId);
      } else {
        await followUser(targetId);
        // OPCIONAL: Al seguirlo, lo quitamos de sugerencias e invalidamos
        // para que traiga a alguien nuevo que no estemos siguiendo.
        queryClient.invalidateQueries({
          queryKey: ["user_suggestions", user?.id],
        });
      }
    } finally {
      setActionId(null);
    }
  };

  if (!isLoading && (!suggestions || suggestions.length === 0)) return null;

  return (
    <div className="bg-white dark:bg-black rounded-xl border border-emerald-500/20 p-4 ...">
      <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-4 text-base">
        A quién seguir
      </h3>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <SuggestionSkeleton />
            <SuggestionSkeleton />
            <SuggestionSkeleton />
          </div>
        ) : (
          suggestions.map((profile) => {
            const following = isFollowing(profile.id);
            return (
              <div
                key={profile.id}
                className="flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Link to={`/profile/${profile.id}`}>
                    <img
                      src={profile.avatar || "/default-avatar.jpg"}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-500/10"
                      alt=""
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link to={`/profile/${profile.id}`}>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {profile.full_name}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {profile?.carrera || "Estudiante"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFollow(profile.id)}
                  disabled={actionId === profile.id}
                  className={`p-2 rounded-full transition-all ${
                    following
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white"
                  }`}
                >
                  {actionId === profile.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : following ? (
                    <UserMinus size={16} />
                  ) : (
                    <UserPlus size={16} />
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
