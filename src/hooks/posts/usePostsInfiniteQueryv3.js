import { supabaseClient } from "@/supabase/supabaseClient";
import { useInfiniteQuery } from "@tanstack/react-query";

export const usePostsInfiniteQuery = (filterConfig = {}) => {
  const fetchPosts = async ({ pageParam = null }) => {
    // 1. Identificar si es un filtro basado en una acción (Like, Bookmark, Repost)
    const isActionFilter = ["likes", "bookmarks", "reposts"].includes(filterConfig.type);

    if (isActionFilter) {
      // Determinamos la tabla según el tipo
      const tableMap = {
        likes: "likes",
        bookmarks: "bookmarks",
        reposts: "reposts",
      };
      const targetTable = tableMap[filterConfig.type];

      // A. Consultar la tabla de la acción para obtener los IDs y el orden real
      let actionQuery = supabaseClient
        .from(targetTable)
        .select("post_id, created_at")
        .eq("user_id", filterConfig.userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (pageParam) {
        actionQuery = actionQuery.lt("created_at", pageParam);
      }

      const { data: actionEntries, error: actionError } = await actionQuery;

      if (actionError) throw actionError;
      if (!actionEntries || actionEntries.length === 0) return [];

      const ids = actionEntries.map((entry) => entry.post_id);

      // B. Consultar los datos enriquecidos de la Vista para esos IDs
      const { data: posts, error: postsError } = await supabaseClient
        .from("posts_with_counts")
        .select(`
          *,
          profiles:user_id (
            id, full_name, avatar, carrera, ciclo,
            equipped_badges:user_badges ( 
              is_equipped,
              badges ( icon, name , category, resource_url)
            )
          ),
          post_media (id, media_url, media_type)
        `)
        .in("id", ids)
        .is("deleted_at", null);

      if (postsError) throw postsError;

      // C. Reordenar los posts según la fecha de la acción (no la del post)
      return actionEntries
        .map((entry) => {
          const post = posts.find((p) => p.id === entry.post_id);
          if (!post) return null;
          return {
            ...post,
            original_post_date: post.created_at, // Guardamos la fecha del post por si acaso
            created_at: entry.created_at,        // Sobrescribimos con la fecha del Like/Repost/Bookmark
          };
        })
        .filter(Boolean);
    }

    // 2. Lógica normal para el Feed Principal o Media (Mantenemos tu lógica original)
    let query = supabaseClient
      .from("posts_with_counts")
      .select(`
        *,
        profiles:user_id (
          id, full_name, avatar, carrera, ciclo,
          equipped_badges:user_badges ( 
            is_equipped,
            badges ( icon, name , category, resource_url)
          )
        ),
        post_media (id, media_url, media_type)
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(10);

    // Filtros por columna (carrera, etc)
    if (filterConfig.column && filterConfig.value) {
      query = query.eq(filterConfig.column, filterConfig.value);
    }

    if (filterConfig.type === "posts") {
      query = query.eq("user_id", filterConfig.userId);
    } else if (filterConfig.type === "media") {
      query = query.eq("user_id", filterConfig.userId).not("post_media", "is", null);
    }

    if (pageParam) {
      query = query.lt("created_at", pageParam);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  };

  return useInfiniteQuery({
    queryKey: ["posts", filterConfig],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < 10) return undefined;
      return lastPage[lastPage.length - 1].created_at;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};