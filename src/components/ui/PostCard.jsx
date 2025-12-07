import CardPost from "./feed/CardPost.jsx";
import ImageSlider from "./ImageSlider.jsx";


const PostCard = ({ posts }) => {
  return (
    <div className="divide-y divide-emerald-500/10 dark:divide-emerald-500/20">
      {posts?.map((post) => {
        const images = post.post_images ?? [];
        //post.video
        return <CardPost key={post.id} images={images} post={post}/>;
      })}
    </div>
  );
};



export default PostCard;
