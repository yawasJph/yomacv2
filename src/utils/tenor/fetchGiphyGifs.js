export const fetchGiphyGifs = async ({
  pageParam = 0,
  query = "trending",
  apiKey,
}) => {
  const isTrending = query === "trending" || !query;
  const limit = 20;

  const endpoint = isTrending
    ? `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${limit}&offset=${pageParam}`
    : `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(
        query
      )}&limit=${limit}&offset=${pageParam}`;

  const res = await fetch(endpoint);

  if (!res.ok) {
    throw new Error("Error al cargar GIFs");
  }

  const data = await res.json();

  return {
    results: data.data.map((gif) => ({
      id: gif.id,
      preview: gif.images.fixed_width_small.url,
      original: gif.images.original.url,
    })),
    next:
      pageParam + limit < data.pagination.total_count
        ? pageParam + limit
        : undefined,
  };
};