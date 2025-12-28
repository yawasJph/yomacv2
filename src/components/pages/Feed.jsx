import { useRef, useEffect } from "react";
import PostCard from "../ui/PostCard";
import { usePostsInfiniteQuery } from "../../hooks/usePostsInfiniteQuery ";
import SkeletonPost from "../skeletons/SkeletonPost";
import CardPost from "../ui/feed/CardPost";

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
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasNextPage, isFetchingNextPage]);

  const allPosts = data?.pages.flat() || [];

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
            <div className="text-center py-6 text-gray-400 text-sm pb-20">
              No hay más publicaciones
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Feed;
