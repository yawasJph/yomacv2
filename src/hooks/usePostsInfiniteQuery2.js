import { useInfiniteQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

// src/hooks/usePostsInfiniteQuery.js
export const usePostsInfiniteQuery = (filterConfig = {}) => {
  const fetchPosts = async ({ pageParam = null }) => {
    let query = supabaseClient
      .from("posts_with_counts")
      .select(
        `
    *,
    profiles:user_id (
      id, 
      full_name, 
      avatar, 
      carrera, 
      ciclo,
      equipped_badges:user_badges ( 
        is_equipped,
        badges ( icon, name , category, resource_url)
      )
    ),
    post_media (id, media_url, media_type)
  `,
      )
      .filter("profiles.user_badges.is_equipped", "eq", true) // Solo traemos las activas
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(10);

    // Aplicar filtros dinámicos si existen (ej. carrera, user_id)
    if (filterConfig.column && filterConfig.value) {
      query = query.eq(filterConfig.column, filterConfig.value);
    }

    // Lógica de Filtros
    if (filterConfig.type === "posts") {
      query = query.eq("user_id", filterConfig.userId);
    } else if (filterConfig.type === "media") {
      query = query
        .eq("user_id", filterConfig.userId)
        .not("post_media", "is", null);
    } else if (filterConfig.type === "likes") {
      // const { data: likedIds } = await supabaseClient
      //   .from("likes")
      //   .select("post_id")
      //   .eq("user_id", filterConfig.userId);
      // const ids = likedIds?.map((l) => l.post_id) || [];
      // if (ids.length === 0) return [];
      // query = query.in("id", ids);
      // 1. Primero obtenemos los IDs y la fecha del like de forma ordenada
      const { data: likedEntries, error: likedError } = await supabaseClient
        .from("likes")
        .select("post_id, created_at")
        .eq("user_id", filterConfig.userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (likedError) throw likedError;
      if (!likedEntries || likedEntries.length === 0) return [];

      const ids = likedEntries.map((l) => l.post_id);

      // 2. Pedimos los datos de la vista para esos IDs
      const { data: posts, error: postsError } = await supabaseClient
        .from("posts_with_counts")
        .select(
          `
      *,
      profiles:user_id (
        id, full_name, avatar, carrera, ciclo,
        equipped_badges:user_badges ( 
          is_equipped,
          badges ( icon, name , category, resource_url)
        )
      ),
      post_media (id, media_url, media_type)
    `,
        )
        .in("id", ids)
        .filter("profiles.user_badges.is_equipped", "eq", true)
        .is("deleted_at", null);

      if (postsError) throw postsError;

      // 3. REORDENAR Y MAPEAR
      // Reordenamos los posts para que coincidan con el orden de los likes (el mapa de IDs)
      // Y reemplazamos el created_at por el del like para que la paginación funcione.
      return likedEntries
        .map((like) => {
          const post = posts.find((p) => p.id === like.post_id);
          if (!post) return null;
          return {
            ...post,
            post_created_at: post.created_at, // Guardamos la original por si la usas en la UI
            created_at: like.created_at, // Usamos la del LIKE como principal para el cursor
          };
        })
        .filter(Boolean); // Limpiamos por si algún post fue borrado pero el like quedó huérfano
    } else if (filterConfig.type === "bookmarks") {
      const { data: bookmarkedIds } = await supabaseClient
        .from("bookmarks")
        .select("post_id")
        .eq("user_id", filterConfig.userId)
        .order("created_at", { ascending: false });

      const ids = bookmarkedIds?.map((b) => b.post_id) || [];
      if (ids.length === 0) return [];

      query = query.in("id", ids);
    }

    if (pageParam) {
      query = query.lt("created_at", pageParam);
    } else if (filterConfig.type === "reposts") {
      // NUEVA LÓGICA PARA REPOSTS
      const { data: repostedIds, error: repostError } = await supabaseClient
        .from("reposts")
        .select("post_id")
        .eq("user_id", filterConfig.userId)
        .order("created_at", { ascending: false });

      if (repostError) throw repostError;

      const ids = repostedIds?.map((r) => r.post_id) || [];
      if (ids.length === 0) return []; // Si no hay reposts, devolvemos array vacío

      // Filtramos la query de posts_with_counts por esos IDs
      query = query.in("id", ids);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  };

  return useInfiniteQuery({
    queryKey: ["posts", filterConfig], // La caché se separa por filtro
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < 10) return undefined;
      return lastPage[lastPage.length - 1].created_at;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de data "fresca"
    refetchOnWindowFocus: false,
  });
};
