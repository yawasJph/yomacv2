export const validateTitle = (title) => {
  const clean = title.trim();

  if (!clean) {
    return "Ponle título pe, no seas tímido 😐";
  }

  if (clean.length < 3) {
    return "Muy corto… dale un poco más de creatividad 😅";
  }

  if (clean.length > 100) {
    return "Te emocionaste… máximo 100 caracteres 🧠";
  }

  return null;
};