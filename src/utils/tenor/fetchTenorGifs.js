export const fetchTenorGifs = async ({ pageParam = "", query = "trending", apiKey }) => {
  const isTrending = query === "trending" || !query;
  const endpoint = isTrending ? "featured" : "search";
  const url = `https://tenor.googleapis.com/v2/${endpoint}?q=${query}&key=${apiKey}&limit=20&pos=${pageParam}&contentfilter=medium`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al cargar GIFs");
  return res.json();
};