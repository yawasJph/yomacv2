import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Github,
  Instagram,
  Linkedin,
} from "lucide-react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useFollow } from "../../context/FollowContext";
import CardPost from "../ui/feed/CardPost";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { isFollowing, followUser, unfollowUser } = useFollow();

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

  console.log(profile);

  //if (loading) return <ProfileSkeleton />;
  if (loading) return <h1>cargando...</h1>;

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
        <div className="h-32 md:h-48 bg-gray-200 dark:bg-gray-800">
          {profile?.cover && (
            <img
              src={profile.cover}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="absolute -bottom-1 left-4">
          <img
            src={profile?.avatar || "/default-avatar.jpg"}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-black object-cover"
            alt={profile?.full_name}
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

      {/* INFORMACIÓN DEL PERFIL */}
      <div className="px-4 mt-8 space-y-3">
        <div>
          <h2 className="text-xl font-extrabold dark:text-white">
            {profile?.full_name}
          </h2>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
            {profile?.carrera || "Estudiante"} {profile?.ciclo}
          </p>
        </div>

        {profile?.socials && (
          <div className="flex gap-3">
            {profile?.socials?.web && (
              <a
                href={profile.socials.web}
                className="text-emerald-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                {profile.socials.web}
              </a>
            )}

            {profile?.socials?.github && (
              <a
                href={profile.socials.github}
                className="text-emerald-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={20} />
              </a>
            )}
            {profile?.socials?.instagram && (
              <a
                href={profile.socials.github}
                className="text-emerald-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={20} />
              </a>
            )}
            {profile?.socials?.linkedin && (
              <a
                href={profile.socials.linkedin}
                className="text-emerald-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin size={20} />
              </a>
            )}
          </div>
        )}

        {profile?.bio && (
          <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-normal">
            {profile.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-gray-500 dark:text-gray-400 text-sm">
          <span className="flex items-center gap-1">
            <Calendar size={16} /> Se unió en{" "}
            {new Date(profile?.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* STATS (Redirigen a la página que creamos antes) */}
        <div className="flex gap-4 pt-2">
          <button
            onClick={() =>
              navigate(`/user/${userId}/connections?tab=following`)
            }
            className="hover:underline flex gap-1 text-sm dark:text-white sm:cursor-pointer"
          >
            <span className="font-bold dark:text-white">
              {profile?.following_count}
            </span>
            <span className="text-gray-500">Siguiendo</span>
          </button>
          <button
            onClick={() =>
              navigate(`/user/${userId}/connections?tab=followers`)
            }
            className="hover:underline flex gap-1 text-sm dark:text-white sm:cursor-pointer"
          >
            <span className="font-bold dark:text-white">
              {profile?.followers_count}
            </span>
            <span className="text-gray-500">Seguidores</span>
          </button>
        </div>
      </div>

      {/* TABS DE CONTENIDO */}
      <div className="mt-4 border-b border-gray-100 dark:border-gray-800 flex sticky top-[107px] bg-white/80 dark:bg-black/80 backdrop-blur-md z-20">
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
