import React, { useEffect, useState } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import PostCard from "../ui/PostCard";

const Feed = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data: posts, error } = await supabaseClient
        .from("posts")
        .select(
             `
          id,
           content,
            created_at,
             profiles(full_name, avatar),
             post_images(id, post_id, image_url)
          `
        )
        .order("created_at", { ascending: false });

      if (posts) setPosts(posts);
      if (error) console.error(error);
    };
    fetchPosts();
  }, []);

  console.log(posts)
  return (
    <>
      {posts && posts.length > 0 ? (
        <>
          <PostCard posts={posts} />
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <h1 className="text-2xl font-bold text-gray-500 dark:text-white">
            No hay publicaciones
          </h1>
        </div>
      )}
    </>
  );
};

export default Feed;
