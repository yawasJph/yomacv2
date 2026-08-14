export const fetchGiphyGifs = async ({ pageParam = 0, query = "trending", apiKey }) => {
  const isTrending = query === "trending" || !query;
  const endpoint = isTrending ? "trending" : "search";
  const baseUrl = `https://api.giphy.com/v1/gifs/${endpoint}`;
  
  const params = new URLSearchParams({
    api_key: apiKey,
    limit: 20,
    offset: pageParam,
    rating: "g", // Puedes ajustar esto a 'pg' o 'pg-13' si lo deseas
  });

  if (!isTrending) {
    params.append("q", query);
  }
  
  const url = `${baseUrl}?${params.toString()}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al cargar GIFs de Giphy");
  return res.json();
};