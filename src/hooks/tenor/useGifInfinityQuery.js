import { fetchTenorGifs } from "@/utils/tenor/fetchTenorGifs";
import { useInfiniteQuery } from "@tanstack/react-query";

const API_KEY = import.meta.env.VITE_TENOR_API_KEY;

export const useGifInfinityQuery = (activeCategory) => {
    return useInfiniteQuery({   
        queryKey: ["tenorGifs", activeCategory],
        queryFn: ({ pageParam }) => fetchTenorGifs({    
            pageParam,
            query: activeCategory,  
            apiKey: API_KEY
        }),
        getNextPageParam: (lastPage) => lastPage.next || undefined,
        staleTime: 1000 * 60 * 10, 
    });
} 


