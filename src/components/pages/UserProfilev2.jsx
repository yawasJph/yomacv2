import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Flag,
  MoreVertical,
  Share,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFollow } from "../../context/FollowContext";
import CardPost from "../ui/feed/CardPost";
import UserProfileSkeleton from "../skeletons/UserProfileSkeleton";
import ImageModal from "../ui/userProfile/ImageModal";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthAction } from "../../hooks/useAuthAction";
import { usePostsInfiniteQuery } from "@/hooks/posts/usePostsInfiniteQueryv3";
import SkeletonPost from "../skeletons/SkeletonPost";
import { optimizeMedia } from "@/cloudinary/optimizeMedia";
import { useProfile } from "@/hooks/user/useProfilev2";
import { handleShareProfile } from "../utils/handleShareProfile";
import SocialLinks from "../socials/SocialLinks";
import UserBadges from "../user/UserBadges";
import DevBadge from "../ui/userProfile/DevBadge";
import { messages } from "@/consts/notFound/notFoundProfile";
import ReportModal from "../ui/ReportModalv6";

const randomMessage = messages[Math.floor(Math.random() * messages.length)];

const UserProfile = () => {
  // 1. Ahora leemos 'username' de la URL, no 'userId'
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const loaderRef = useRef();
  const queryClient = useQueryClient(); // 👈 Inicializar

  const [selectedImg, setSelectedImg] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [actionLoading, setActionLoading] = useState(false);
  // 2. Traer el perfil usando el USERNAME de la URL
  const { data: profile, isLoading: profileLoading } = useProfile(username);
  // 3. 🚨 EXTRAER EL userId REAL (Una vez que el perfil carga)
  const userId = profile?.id;
  const isMe = currentUser?.id === userId;
  // 4. Hooks que dependen del userId REAL (solo funcionan si userId existe)
  const { executeAction } = useAuthAction();
  const { isFollowing, followUser, unfollowUser } = useFollow();
  const [reportUserId, setReportUserId] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const isDev = profile?.username === "jllacuash";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  /* Cerrar al hacer click fuera */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openReportModal = (userId) => {
    setReportUserId(userId);
    setReportModalOpen(true);
  };

  const trollActions = [
    () => navigate("/"),
    () => navigate(-1),
    () => navigate("/games"),
    () => navigate("/users"),
    () => alert("Nada por aquí 👀"),
  ];

  // 5. Cargar posts paginados usando el userId real (habilitado solo si hay userId)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
  } = usePostsInfiniteQuery(
    // Primer objeto: filterConfig (Tus variables)
    { type: activeTab, userId },
    // Segundo objeto: options (Reglas de React Query)
    { enabled: !!userId }, // 👈 ¡Ahora sí funcionará y esperará a que el userId exista!
  );

  const following = isFollowing(userId);
  const allPosts = data?.pages.flat() || [];

  const hanldeFollowAction = () => {
    executeAction(handleFollowToggle, "para segui a este usuario");
  };

  const handleFollowToggle = async () => {
    if (actionLoading || !userId) return;
    setActionLoading(true);

    try {
      if (following) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      queryClient.invalidateQueries({ queryKey: ["profile", username] }); // Refrescar por username
      queryClient.invalidateQueries({ queryKey: ["profile", currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["user_suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["connections", userId] });
      queryClient.invalidateQueries({ queryKey: ["mutuals"] });
    } catch (error) {
      console.error("Error al cambiar estado", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Observer para el Scroll Infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Pantalla de carga mientras se busca el username
  if (profileLoading) return <UserProfileSkeleton />;

  // Si buscó el username y no existe en la BD
  if (!profile) {
    return (
      <div className="min-h-[500px] sm:min-h-screen flex flex-col items-center justify-center text-center px-6">
        {/* ICONO */}
        <div className="bg-gray-100 dark:bg-neutral-800 p-6 rounded-full mb-6 cursor-pointer hover:scale-105 transition">
          🕵️
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {randomMessage.title}
        </h2>

        {/* DESC */}
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
          {randomMessage.desc}
        </p>

        {randomMessage.desc2 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
            {randomMessage.desc2}
          </p>
        )}

        {/* BUTTONS */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-gray-200 dark:bg-neutral-700 rounded-full hover:scale-105 transition dark:text-white"
          >
            {randomMessage.btnBack ?? "Volver"}
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition"
          >
            {randomMessage.btnHome ?? "Inicio"}
          </button>

          <button
            onClick={() => navigate("/users")}
            className="px-5 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
          >
            {randomMessage.btnExplore ?? "Explorar 🔍"}
          </button>

          <button
            onClick={() => {
              const action =
                trollActions[Math.floor(Math.random() * trollActions.length)];
              action();
            }}
            className="px-5 py-2 bg-pink-500 text-white rounded-full hover:scale-105 transition"
          >
            {randomMessage.btnTroll ?? "??? 🎲"}
          </button>
        </div>

        {/* EXTRA */}
        {randomMessage.extra && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-8">
            {randomMessage.extra}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-10">
      {/* min-h-screen */}
      {/* HEADER SUPERIOR (Sticky) */}
      {/* <div className="sticky top-[57px] z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-2 flex items-center gap-6 border-b border-transparent">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold dark:text-white leading-tight">
              {profile.full_name}
            </h1>
            {profile.is_banned && (
              <ShieldAlert size={16} className="text-rose-500" />
            )}
          </div>
          <span className="text-xs text-gray-500">
            @{profile.username} • {allPosts.length}{" "}
            {activeTab === "posts" && "publicaciones"}
            {activeTab === "media" && "medias"}
            {activeTab === "likes" && "likes"}
            {activeTab === "reposts" && "reposts"}
          </span>
        </div>
      </div> */}

      {/* <div className="sticky top-[57px] z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-2 flex items-center justify-between border-b border-transparent">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="dark:text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold dark:text-white leading-tight">
                {profile.full_name}
              </h1>
              {profile.is_banned && (
                <ShieldAlert size={16} className="text-rose-500" />
              )}
            </div>
            <span className="text-xs text-gray-500">
              @{profile.username} • {allPosts.length}{" "}
              {activeTab === "posts" && "publicaciones"}
              {activeTab === "media" && "medias"}
              {activeTab === "likes" && "likes"}
              {activeTab === "reposts" && "reposts"}
            </span>
          </div>
        </div>

        <button
          onClick={() => handleShareProfile(profile)}
          className="p-2 mr-2 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-full transition-colors flex items-center justify-center"
          title="Compartir perfil"
        >
          <Share size={20} />
        </button>
      </div> */}
      <div className="sticky top-[57px] z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-2 flex items-center justify-between border-b border-transparent">
        {/* IZQUIERDA */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="dark:text-white" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold dark:text-white leading-tight">
                {profile.full_name}
              </h1>

              {profile.is_banned && (
                <ShieldAlert size={16} className="text-rose-500" />
              )}
            </div>

            <span className="text-xs text-gray-500">
              @{profile.username} • {allPosts.length}{" "}
              {activeTab === "posts" && "publicaciones"}
              {activeTab === "media" && "medias"}
              {activeTab === "likes" && "likes"}
              {activeTab === "reposts" && "reposts"}
            </span>
          </div>
        </div>

        {/* DERECHA: MENÚ */}
        <div className="relative mr-2" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-full transition-colors"
          >
            <MoreVertical size={20} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95">
              {/* Compartir */}
              <button
                onClick={() => {
                  handleShareProfile(profile);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition dark:text-white"
              >
                <Share size={16} />
                Compartir perfil
              </button>

              {/* Reportar */}
              {!isMe && (
                <button
                  onClick={() => {
                    openReportModal(profile.id); // 👈 aquí llamas tu modal
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                >
                  <Flag size={16} />
                  Reportar usuario
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div
          className="h-32 md:h-48 bg-gray-200 dark:bg-gray-800 cursor-zoom-in"
          onClick={() => profile?.cover && setSelectedImg(profile.cover)}
        >
          {profile?.cover && (
            <img
              src={optimizeMedia(profile.cover, "image")}
              alt="Cover"
              className="w-full h-full object-cover"
              loading="lazy"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          )}
        </div>

        <div className="absolute bottom-3 sm:bottom-0 left-4">
          <div className="relative">
            <img
              src={
                optimizeMedia(profile?.avatar, "image") || "/default-avatar.jpg"
              }
              className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-black object-cover ${profile?.is_banned ? "grayscale opacity-70" : ""}`}
              alt={profile?.full_name}
              onClick={() => profile?.avatar && setSelectedImg(profile.avatar)}
              loading="lazy"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
            {/* Overlay de baneo sobre el avatar */}
            {profile?.is_banned && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-rose-500 text-white p-1.5 rounded-full shadow-lg">
                  <ShieldAlert size={20} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTÓN ACCIÓN (Editar o Seguir) */}
        <div className="flex justify-end p-4">
          {profile?.is_banned ? (
            <div className="px-4 py-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full font-bold text-xs uppercase tracking-wider border border-rose-100 dark:border-rose-500/20">
              Cuenta Suspendida
            </div>
          ) : isMe ? (
            <Link
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full font-bold text-sm dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              to={"/editProfile"}
            >
              Editar perfil
            </Link>
          ) : (
            <button
              onClick={hanldeFollowAction}
              disabled={actionLoading}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                following
                  ? "border border-gray-300 dark:border-gray-700 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 hover:border-red-200"
                  : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
              } ${actionLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : following ? (
                "Siguiendo"
              ) : (
                "Seguir"
              )}
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
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-extrabold dark:text-white tracking-tight sm:text-2xl sm:font-black">
              {profile?.full_name}
            </h2>
            {/* Cartel llamativo de baneo */}
            {profile?.is_banned && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                Baneado
              </span>
            )}
          </div>
          {/* RENDERIZADO DE INSIGNIAS */}
          {profile?.equipped_badges && (
            <div className="flex items-center gap-1">
              <UserBadges badges={profile.equipped_badges || []} />
            </div>
          )}

          <div className="flex justify-between items-center gap-2 mt-1">
            <div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                {profile?.carrera || "Estudiante"}
              </span>
              {profile?.ciclo && (
                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                  Ciclo {profile.ciclo}
                </span>
              )}
            </div>
            {isDev && <DevBadge />}
          </div>
        </div>

        {/* REDES SOCIALES ESTILO PREMIUM */}
        {profile?.socials && <SocialLinks socials={profile.socials} />}

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

      {/* STATS (Asegúrate de cambiar las rutas de Connections para usar el USERNAME) */}
      {/* <div className="flex gap-6 pt-3 border-t  border-gray-50 dark:border-gray-900 mt-3 px-4">
        <button
          onClick={() => navigate(`/profile/@${profile.username}/connections?tab=following`)}
          className="group flex gap-1.5 text-sm"
        >
          <span className="font-bold dark:text-white group-hover:underline">
            {profile.following_count}
          </span>
          <span className="text-gray-500">Siguiendo</span>
        </button>
        <button
          onClick={() => navigate(`/profile/@${profile.username}/connections?tab=followers`)}
          className="group flex gap-1.5 text-sm"
        >
          <span className="font-bold dark:text-white group-hover:underline">
            {profile.followers_count}
          </span>
          <span className="text-gray-500">Seguidores</span>
        </button>
      </div> */}

      {/* TABS DE CONTENIDO */}
      <div className="mt-4 border-b border-t border-gray-100 dark:border-gray-800 flex sticky top-[107px] bg-white/80 dark:bg-black/80 backdrop-blur-md z-20">
        {["posts", "media", "likes", "reposts"].map((tab) => (
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

      {/* LISTADO DE POSTS CON INFINITE SCROLL */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {postsLoading ? (
          <div>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonPost key={i} />
            ))}
          </div>
        ) : allPosts.length > 0 ? (
          <>
            {allPosts.map((post) => (
              <CardPost
                key={post.id}
                post={post}
                media={post.post_media}
                isRepostView={true}
                tab={activeTab}
              />
            ))}
            <div ref={loaderRef} className="h-10 flex justify-center py-4">
              {isFetchingNextPage && (
                <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
              )}
            </div>
          </>
        ) : (
          <div className="p-20 text-center text-gray-500">
            No hay contenido para mostrar.
          </div>
        )}
      </div>
      {allPosts.length > 0 && !hasNextPage && (
        <div className=" text-center text-gray-500">
          No hay contenido para mostrar.
        </div>
      )}

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        userId={reportUserId}
      />
    </div>
  );
};

export default UserProfile;
