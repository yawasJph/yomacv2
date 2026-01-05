import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Hash, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../hooks/useSearch";
import { useIsMobile } from "../../hooks/useIsMobile";
// UI Components
import CardPost from "../ui/feed/CardPost";
import UserSearchCard from "../ui/UserSearchCard";
import SearchBar from "../ui/SearchBar";
import TrendingTopics from "../ui/rigthSidebar/TrendingTopics";
//import UserSuggestions from "../ui/rigthSidebar/UserSuggestions";
import NoResultsMessage from "../ui/NoResultsMessage";
import UserSuggestions from "../ui/rigthSidebar/UserSuggestions2";

const SearchPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const query = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState("posts");

  const { data, isLoading } = useSearch(query, user?.id);
  const results = data || { posts: [], users: [] };
console.log(results)
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* HEADER */}
      <div className="sticky top-[57px] z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button onClick={() => navigate(-1)} className="p-1 dark:text-white">
              <ArrowLeft size={24} />
            </button>
          )}
          
          {isMobile ? (
            <div className="flex-1"><SearchBar /></div>
          ) : (
            <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
              {query.startsWith("#") ? <Hash className="text-emerald-500" /> : <Search className="text-emerald-500" />}
              {query ? `Resultados para "${query}"` : "Explorar"}
            </h2>
          )}
        </div>
      </div>

      <div className="mx-auto pb-20">
        {!query ? (
          /* PANTALLA INICIAL: TENDENCIAS */
          <div className="p-4 space-y-8 animate-in fade-in duration-500">
            <section>
              <h3 className="text-lg font-bold dark:text-white mb-4 px-2">Tendencias</h3>
              <TrendingTopics />
            </section>
            <section>
              <h3 className="text-lg font-bold dark:text-white mb-4 px-2">Recomendados</h3>
              <UserSuggestions />
            </section>
          </div>
        ) : isLoading ? (
          <div className="p-10 text-center text-gray-500">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mb-2"></div>
            <p>Buscando...</p>
          </div>
        ) : (
          /* RESULTADOS CON TABS */
          <>
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              {["posts", "users"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-bold capitalize transition-colors ${
                    activeTab === tab ? "text-emerald-500 border-b-2 border-emerald-500" : "text-gray-500"
                  }`}
                >
                  {tab === "posts" ? "Publicaciones" : "Personas"}
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-gray-100 dark:bg-gray-800">
                    {tab === "posts" ? results.posts.length : results.users.length}
                  </span>
                </button>
              ))}
            </div>

            <div className="divide-y divide-gray-50 dark:divide-gray-900">
              {activeTab === "posts" ? (
                results.posts.length > 0 ? (
                  results.posts.map((post) => <CardPost key={post.id} post={post} media={post.post_media} />)
                ) : <NoResultsMessage query={query} />
              ) : (
                results.users.length > 0 ? (
                  results.users.map((u) => <UserSearchCard key={u.id} profile={u} />)
                ) : <NoResultsMessage query={query} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;