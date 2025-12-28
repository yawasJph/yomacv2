import CardPost from "./feed/CardPost.jsx";

const PostCard = ({ posts }) => {
  
  return (
    <div className="divide-y divide-emerald-500/10 dark:divide-emerald-500/20">
      {posts?.map((post) => {
        const media = post.post_media ?? [];
        return <CardPost key={post.id} media={media} post={post}/>;
      })}
    </div>
  );
};

export default PostCard;
