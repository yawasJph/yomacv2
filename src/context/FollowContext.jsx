import { createContext, useContext, useState, useEffect } from "react";
import { supabaseClient } from "../supabase/supabaseClient";
import { useAuth } from "./AuthContext";

const FollowContext = createContext();

export const FollowProvider = ({ children }) => {
  const { user } = useAuth();
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Cargar seguidos al iniciar o cambiar de usuario
  useEffect(() => {
    if (!user) {
      setFollowingIds(new Set());
      setLoading(false);
      return;
    }

    const fetchFollowing = async () => {
      const { data, error } = await supabaseClient
        .from("followers")
        .select("following_id")
        .eq("follower_id", user.id);

      if (!error && data) {
        setFollowingIds(new Set(data.map((item) => item.following_id)));
      }
      setLoading(false);
    };

    fetchFollowing();
  }, [user]);

  // Función global para seguir
  const followUser = async (targetId) => {
    const { error } = await supabaseClient
      .from("followers")
      .insert({ follower_id: user.id, following_id: targetId });

    if (!error) {
      setFollowingIds((prev) => new Set([...prev, targetId]));
      return true;
    }
    return false;
  };

  const unfollowUser = async (targetId) => {
    if (!user) return false;

    const { error } = await supabaseClient
      .from("followers")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetId);

    if (!error) {
      setFollowingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(targetId);
        return newSet;
      });
      return true;
    }
    return false;
  };

  // Función para saber si sigo a alguien
  const isFollowing = (targetId) => followingIds.has(targetId);

  return (
    <FollowContext.Provider
      value={{ followingIds, followUser, isFollowing, loading, unfollowUser }}
    >
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => useContext(FollowContext);
