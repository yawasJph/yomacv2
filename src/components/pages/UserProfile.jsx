import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Github,
  Globe,
  Instagram,
  Linkedin,
} from "lucide-react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useFollow } from "../../context/FollowContext";
import CardPost from "../ui/feed/CardPost";
import UserProfileSkeleton from "../skeletons/UserProfileSkeleton";
import ImageModal from "../ui/userProfile/ImageModal";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { isFollowing, followUser, unfollowUser } = useFollow();
  const [selectedImg, setSelectedImg] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  const isMe = currentUser?.id === userId;
  const following = isFollowing(userId);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      // 1. Datos del perfil con stats
      const { data: profileData } = await supabaseClient
        .from("profiles_with_stats")
        .select("*")
        .eq("id", userId)
        .single();

      // 2. Posts del usuario
      const { data: postsData } = await supabaseClient
        .from("posts")
        .select("*, profiles:user_id(*), post_media(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setProfile(profileData);
      setPosts(postsData || []);
      setLoading(false);
    };

    fetchProfileData();
  }, [userId]);

  if (loading) return <UserProfileSkeleton />;

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20">
      {/* HEADER SUPERIOR (Sticky) */}
      <div className="sticky top-[57px] z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-2 flex items-center gap-6 border-b border-transparent">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <div>
          <h1 className="text-lg font-bold dark:text-white leading-tight">
            {profile?.full_name}
          </h1>
          <span className="text-xs text-gray-500">
            {posts.length} publicaciones
          </span>
        </div>
      </div>

      {/* BANNER & AVATAR */}
      <div className="relative">
        <div className="h-32 md:h-48 bg-gray-200 dark:bg-gray-800 cursor-zoom-in"
        onClick={() => profile?.cover && setSelectedImg(profile.cover)}>
          {profile?.cover && (
            <img
              src={profile.cover}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="absolute bottom-3 sm:bottom-0 left-4">
          <img
            src={profile?.avatar || "/default-avatar.jpg"}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-black object-cover"
            alt={profile?.full_name}
            onClick={() => profile?.avatar && setSelectedImg(profile.avatar)}
          />
        </div>

        {/* BOTÓN ACCIÓN (Editar o Seguir) */}
        <div className="flex justify-end p-4">
          {isMe ? (
            <Link
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full font-bold text-sm dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              to={"/editProfile"}
            >
              Editar perfil
            </Link>
          ) : (
            <button
              onClick={() =>
                following ? unfollowUser(userId) : followUser(userId)
              }
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                following
                  ? "border border-gray-300 dark:border-gray-700 dark:text-white"
                  : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
              }`}
            >
              {following ? "Siguiendo" : "Seguir"}
            </button>
          )}
        </div>
      </div>

      {/* Renderizar el Modal si hay una imagen seleccionada */}
      {selectedImg && (
        <ImageModal src={selectedImg} onClose={() => setSelectedImg(null)} />
      )}

      {/* INFORMACIÓN DEL PERFIL */}
      <div className="px-4 mt-5 space-y-3">
        <div>
          <h2 className="text-xl font-extrabold dark:text-white tracking-tight sm:text-2xl sm:font-black">
            {profile?.full_name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {profile?.carrera || "Estudiante"}
            </span>
            {profile?.ciclo && (
              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                Ciclo {profile.ciclo}
              </span>
            )}
          </div>
        </div>

        {/* REDES SOCIALES ESTILO PREMIUM */}
        {profile?.socials && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(profile.socials).map(([platform, url]) => {
              if (!url) return null;
              const icons = {
                github: <Github size={18} />,
                instagram: <Instagram size={18} />,
                linkedin: <Linkedin size={18} />,
                web: <Globe size={18} />,
              };
              return (
                <a
                  key={platform}
                  href={url.startsWith("http") ? url : `https://${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-200 transition-all shadow-sm"
                >
                  {icons[platform] || <Globe size={18} />}
                </a>
              );
            })}
          </div>
        )}

        {profile?.bio && (
          <p className="text-gray-800 dark:text-gray-200 text-[15px] leading-[1.6] whitespace-pre-line">
            {profile.bio}
          </p>
        )}

        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-[13px] font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="opacity-70" />
            Se unió en{" "}
            {new Date(profile?.created_at).toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* STATS */}
      <div className="flex gap-6 pt-3 border-t  border-gray-50 dark:border-gray-900 mt-3 px-4">
        <button
          onClick={() => navigate(`/user/${userId}/connections?tab=following`)}
          className="group flex gap-1.5 text-sm"
        >
          <span className="font-bold dark:text-white group-hover:underline">
            {profile?.following_count}
          </span>
          <span className="text-gray-500">Siguiendo</span>
        </button>
        <button
          onClick={() => navigate(`/user/${userId}/connections?tab=followers`)}
          className="group flex gap-1.5 text-sm"
        >
          <span className="font-bold dark:text-white group-hover:underline">
            {profile?.followers_count}
          </span>
          <span className="text-gray-500">Seguidores</span>
        </button>
      </div>

      {/* TABS DE CONTENIDO */}
      <div className="mt-4 border-b border-t border-gray-100 dark:border-gray-800 flex sticky top-[107px] bg-white/80 dark:bg-black/80 backdrop-blur-md z-20">
        {["posts", "media", "likes"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-bold capitalize transition-colors ${
              activeTab === tab
                ? "text-emerald-500 border-b-2 border-emerald-500"
                : "text-gray-500"
            }`}
          >
            {tab === "posts" ? "Publicaciones" : tab}
          </button>
        ))}
      </div>

      {/* RENDER DE PUBLICACIONES */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {posts.length > 0 ? (
          posts.map((post) => (
            <CardPost key={post.id} post={post} media={post.post_media} />
          ))
        ) : (
          <div className="p-10 text-center text-gray-500">
            Este usuario aún no tiene publicaciones.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
