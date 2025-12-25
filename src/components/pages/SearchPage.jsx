import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Hash, Search } from "lucide-react";
import { supabaseClient } from "../../supabase/supabaseClient";
import CardPost from "../ui/feed/CardPost";
import { useIsMobile } from "../../hooks/useIsMobile";
import SearchBar from "../ui/SearchBar";
import TrendingTopics from "../ui/rigthSidebar/TrendingTopics";
import UserSuggestions from "../ui/rigthSidebar/UserSuggestions";
import NoResultsMessage from "../ui/NoResultsMessage";
import UserSearchCard from "../ui/UserSearchCard";
import { useAuth } from "../../context/AuthContext";

const SearchPage = () => {
  const { user: currentUser } = useAuth(); // 2. Obtén el usuario logueado
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [loading, setLoading] = useState(false); // Falso por defecto si no hay query
  const [postResults, setPostResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [activeTab, setActiveTab] = useState("posts"); // "posts" o "users"

  const isMobile = useIsMobile();

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      const cleanQuery = query.startsWith("#") ? query.slice(1) : query;

      // Ejecutamos ambas en paralelo
      const [resPosts, resUsers] = await Promise.all([
        supabaseClient
          .from("posts_search_view")
          .select("*, profiles:user_id(*), post_media(*)")
          .or(
            `content.ilike.%${cleanQuery}%, hashtag_names.ilike.%${cleanQuery}%`
          ),
        supabaseClient
          .from("profiles")
          .select(
            `
            *,
            followers!following_id (follower_id) 
            `
          )
          .eq("followers.follower_id", currentUser?.id) // Solo buscamos si YO los sigo
          .or(`full_name.ilike.%${cleanQuery}%, carrera.ilike.%${cleanQuery}%`),
      ]);

      // PROCESAMIENTO DE USUARIOS:
      // Si 'followers' tiene algo, significa que ya lo sigo.
      const processedUsers = (resUsers.data || []).map(profile => ({
        ...profile,
        is_already_followed: profile.followers && profile.followers.length > 0
      }));

      setPostResults(resPosts.data || []);
      setUserResults(processedUsers || []);
      setLoading(false);
    };

    fetchAll();
  }, [query, currentUser?.id]);


  console.log(postResults);
  console.log(userResults);
  return (
    <div className="min-h-screen">
      {/* HEADER DINÁMICO */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-15 z-10">
        <div className="flex items-center gap-3">
          {/* Botón Volver solo en móvil */}
          {isMobile && (
            <button
              onClick={() => navigate(-1)}
              className="p-1 dark:text-white"
            >
              <ArrowLeft size={24} />
            </button>
          )}

          {/* Si es móvil, mostramos el SearchBar aquí arriba directamente */}
          {isMobile ? (
            <div className="flex-1">
              <SearchBar />
            </div>
          ) : (
            <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
              {query.startsWith("#") ? (
                <Hash className="text-emerald-500" />
              ) : (
                <Search className="text-emerald-500" />
              )}
              {query ? `Resultados para "${query}"` : "Explorar"}
            </h2>
          )}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="mx-auto">
        {!query ? (
          /* ESTADO INICIAL: MOSTRAR TENDENCIAS Y SUGERENCIAS (Ideal para Móvil) */
          <div className="p-4 space-y-8 animate-in fade-in duration-500">
            <div>
              <h3 className="text-lg font-bold dark:text-white mb-4 px-2">
                Descubrir Tendencias
              </h3>
              <TrendingTopics />
            </div>
            <div>
              <h3 className="text-lg font-bold dark:text-white mb-4 px-2">
                Personas recomendadas
              </h3>
              <UserSuggestions />
            </div>
          </div>
        ) : loading ? (
          /* ESTADO DE CARGA */
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mb-2"></div>
            <p>Buscando en la red...</p>
          </div>
        ) : postResults.length > 0 || userResults.length > 0 ? (
          /* RESULTADOS */
          <>
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${
                  activeTab === "posts"
                    ? "text-emerald-500 border-b-2 border-emerald-500"
                    : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                Publicaciones
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] mx-1 ${
                    activeTab === "posts"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {postResults.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${
                  activeTab === "users"
                    ? "text-emerald-500 border-b-2 border-emerald-500"
                    : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                Personas
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] mx-1 ${
                    activeTab === "users"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {userResults.length}
                </span>
              </button>
            </div>

            {/* Dentro de SearchPage.jsx, en la sección de resultados */}

            {activeTab === "posts" ? (
              // Renderizado de publicaciones (CardPost)
              postResults.length > 0 ? (
                postResults.map((post) => (
                  <CardPost key={post.id} post={post} media={post.post_media} />
                ))
              ) : (
                <NoResultsMessage query={query} />
              )
            ) : // Renderizado de Personas (UserSearchCard)
            userResults.length > 0 ? (
              <div className="animate-in slide-in-from-right-4 duration-300">
                {userResults.map((u) => (
                  <UserSearchCard key={u.id} profile={u} />
                ))}
              </div>
            ) : (
              <NoResultsMessage query={query} />
            )}
          </>
        ) : (
          /* SIN RESULTADOS */
          <div className="p-20 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No encontramos resultados para "{query}". Prueba con otras
              palabras clave.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
