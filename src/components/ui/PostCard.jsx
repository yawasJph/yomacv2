import ImageSlider from "./ImageSlider.jsx";


const PostCard = ({ posts }) => {
  return (
    <div className="divide-y divide-emerald-500/10 dark:divide-emerald-500/20">
      {posts?.map((post) => {
        const images = post.post_images ?? [];
        return <ImageSlider key={post.id} post={post} images={images} />;
      })}
    </div>
  );
};



export default PostCard;
