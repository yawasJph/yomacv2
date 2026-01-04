// hooks/useConnections.js
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

export const useConnections = (userId) => {
  return useQuery({
    queryKey: ["connections", userId],
    queryFn: async () => {
      // 1. Obtener IDs de seguidores y seguidos en paralelo
      const [resFollowers, resFollowing] = await Promise.all([
        supabaseClient.from("followers").select("follower_id").eq("following_id", userId),
        supabaseClient.from("followers").select("following_id").eq("follower_id", userId),
      ]);

      const followerIds = resFollowers.data?.map((f) => f.follower_id) || [];
      const followingIds = resFollowing.data?.map((f) => f.following_id) || [];

      // 2. Obtener perfiles completos
      const [profilesFollowers, profilesFollowing] = await Promise.all([
        followerIds.length > 0
          ? supabaseClient.from("profiles_with_stats").select("*").in("id", followerIds)
          : { data: [] },
        followingIds.length > 0
          ? supabaseClient.from("profiles_with_stats").select("*").in("id", followingIds)
          : { data: [] },
      ]);

      return {
        followers: profilesFollowers.data || [],
        following: profilesFollowing.data || [],
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });
};