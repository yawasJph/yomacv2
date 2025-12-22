/**
 * Sube un archivo a Cloudinary y devuelve la URL segura.
 * @param {File} file - El archivo obtenido de un input o drag & drop.
 * @returns {Promise<Object>} - Datos de la respuesta de Cloudinary.
 */
export const uploadToCloudinary = async (file) => {
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  // 1. Validación de configuración
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Faltan las variables de entorno de Cloudinary.");
  }

  // 2. Preparación de los datos
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    // 3. Petición a la API
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    // 4. Verificación de respuesta
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Error al subir a Cloudinary");
    }

    const data = await response.json();
    return data; // Contiene secure_url, public_id, etc.

  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};