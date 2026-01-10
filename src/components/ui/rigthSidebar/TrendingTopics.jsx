
import { useNavigate } from "react-router-dom";
import { useAuthAction } from "../../../hooks/useAuthAction";
import { useTrendingHashtags } from "../../../hooks/useTrendingHashtags";

const TrendingTopics = () => {
  const { data: trends, isLoading } = useTrendingHashtags();
  const navigate = useNavigate()
  const {executeAction} = useAuthAction();
 

  const handleSearchTrend = (trendName)=>{
    if(!trendName) return
    navigate(`/search?q=${encodeURIComponent(trendName.trim())}`);
  }

  const handleClick = (trendName) =>{
    executeAction(()=>{
      handleSearchTrend(trendName);
    },"buscar trends")
  }

  if (isLoading) return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-4 bg-emerald-100 dark:bg-emerald-900/20 rounded w-1/3"></div>
      <div className="space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded"></div>)}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-black rounded-xl border border-emerald-500/20 dark:border-emerald-500/30 p-4 hover:border-emerald-500/40 dark:hover:border-emerald-500/50 transition-all duration-300">
      <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-4 text-base">
        Tendencias
      </h3>
      <div className="space-y-1">
        {trends.length > 0 ? (
          trends.map((topic) => (
            <div
              key={topic.id}
              className="flex justify-between items-center group cursor-pointer p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors duration-200"
              onClick={()=> handleSearchTrend(topic.name)}
            >
              <span className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-medium transition-colors">
                #{topic.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {topic.post_count} {topic.post_count === 1 ? 'post' : 'posts'}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-500 p-2">No hay tendencias aún</p>
        )}
      </div>
    </div>
  );
};

export default TrendingTopics;