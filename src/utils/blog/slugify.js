export const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Elimina acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-') // Reemplaza espacios por guiones
    .replace(/[^\w-]+/g, '') // Elimina caracteres especiales
    .replace(/--+/g, '-'); // Elimina guiones dobles
};