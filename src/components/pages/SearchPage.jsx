import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Hash, Search } from "lucide-react";
import { supabaseClient } from "../../supabase/supabaseClient";
import CardPost from "../ui/feed/CardPost";
import { useIsMobile } from "../../hooks/useIsMobile";
import SearchBar from "../ui/SearchBar";
import TrendingTopics from "../ui/rigthSidebar/TrendingTopics";
import UserSuggestions from "../ui/rigthSidebar/UserSuggestions";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false); // Falso por defecto si no hay query

  const isMobile = useIsMobile();

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      const cleanQuery = query.startsWith("#") ? query.slice(1) : query;

      const { data, error } = await supabaseClient
        .from("posts_search_view")
        .select(`*, profiles:user_id (*), post_media (*)`)
        .or(
          `content.ilike.%${cleanQuery}%, hashtag_names.ilike.%${cleanQuery}%`
        )
        .order("created_at", { ascending: false });

      if (!error) setResults(data);
      else console.log("Error en la busqueda:", error)
      setLoading(false);
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen">
      {/* HEADER DINÁMICO */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-10">
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
              <TrendingTopics/>
              <UserSuggestions/>
            </div>
          </div>
        ) : loading ? (
          /* ESTADO DE CARGA */
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mb-2"></div>
            <p>Buscando en la red...</p>
          </div>
        ) : results.length > 0 ? (
          /* RESULTADOS */
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {results.map((post) => (
              <CardPost key={post.id} post={post} media={post.post_media} />
            ))}
          </div>
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
