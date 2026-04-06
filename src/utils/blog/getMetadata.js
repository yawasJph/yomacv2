// Función para calcular tiempo de lectura y resumen
export const getMetadata = (html) => {
  const text = html.replace(/<[^>]*>/g, ""); // Quitar etiquetas HTML
  const words = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / 200); // Promedio 200 palabras x min
  const excerpt = text.substring(0, 150) + "..."; // Primeros 150 caracteres
  return { readingTime, excerpt };
};
