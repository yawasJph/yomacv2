// Función para extraer hashtags únicos del texto
export const extractHashtags = (text) => {
  if (!text) return [];
  // Busca palabras que empiecen con # y tengan letras/números
  const regex = /#(\w+)/g;
  const matches = text.match(regex);
  if (!matches) return [];
  // Limpiar el # y pasar a minúsculas, eliminando duplicados
  return [...new Set(matches.map(h => h.slice(1).toLowerCase()))];
};