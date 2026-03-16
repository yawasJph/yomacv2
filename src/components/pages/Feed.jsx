import { useRef, useEffect } from "react";
import SkeletonPost from "../skeletons/SkeletonPost";
import CardPost from "../ui/feed/CardPost";
import { usePostsInfiniteQuery } from "@/hooks/posts/usePostsInfiniteQueryv3";

const Feed = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePostsInfiniteQuery();

  const loaderRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1},
    );

    const current = loaderRef.current;

    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  //const allPosts = data?.pages.flat() || [];
  const allPosts = data?.pages.flatMap(page => page) ?? [];

  return (
    <>
      {isLoading ? (
        <div>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonPost key={i} />
          ))}
        </div>
      ) : (
        <>
          {allPosts.map((post) => (
            <CardPost key={post.id} post={post} media={post.post_media ?? []} />
          ))}

          {/* Loader para infinite scroll */}
          <div ref={loaderRef} className="py-4 flex justify-center">
            {isFetchingNextPage && (
              <p className="text-gray-500 dark:text-gray-300">
                Cargando más publicaciones...
              </p>
            )}
          </div>

          {!hasNextPage && (
            <div className="text-center py-6 text-gray-400 text-sm pb-10">
              No hay más publicaciones
             
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Feed;
