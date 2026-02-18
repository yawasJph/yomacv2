// import { toast } from "sonner";

// export  const handleShare = async (post) => { 
  
//   const shareData = {
//     title: `Post de ${post.profiles.full_name} en YoMAC`,
//     text: post.content?.substring(0, 100) + "...",
//     url: `https://yomacv2.vercel.app/share/${post.id}`
//   };

//   try {
//     // 1. Intentar usar la API nativa de compartir (Móviles)
//     if (navigator.share) {
//       await navigator.share(shareData);
//     } else {
//       await navigator.clipboard.writeText(shareData.url);
//       toast.success("Enlace copiado al portapapeles");
//     }
//   } catch (err) {
//     if (err.name !== "AbortError") {
//       console.error("Error al compartir:", err);
//       toast.error("No se pudo compartir");
//     }
//   }
// };

// export const handleShare = async (post) => {
//   // 1. Limpiamos el contenido del post por si tiene el link externo que confunde al OS
//   let cleanText = post.content || "";
//   if (post.og_data?.url) {
//     cleanText = cleanText.replace(post.og_data.url, "").trim();
//   }

//   // Acortamos para que quepa bien en el mensaje
//   const finalText = cleanText.length > 100 
//     ? cleanText.substring(0, 100) + "..." 
//     : cleanText;

//   const shareData = {
//     title: `Post de ${post.profiles.full_name}`,
//     text: finalText || "Mira este post en YoMAC",
//     url: `https://yomacv2.vercel.app/share/${post.id}` 
//   };

//   try {
//     if (navigator.share) {
//       // IMPORTANTE: Algunos sistemas fallan si mandas title, text Y url.
//       // A veces es mejor combinar text y url en el campo text.
//       await navigator.share(shareData);
//     } else {
//       await navigator.clipboard.writeText(shareData.url);
//       toast.success("Enlace copiado al portapapeles");
//     }
//   } catch (err) {
//     if (err.name !== "AbortError") {
//       console.error("Error al compartir:", err);
//     }
//   }
// };

export const handleShare = async (post) => {
  let cleanText = post.content || "";

  // 1. Definimos el Regex para encontrar URLs (http, https, www)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

  // 2. Si tenemos og_data.url, quitamos ESE link específico primero (por precisión)
  if (post.og_data?.url) {
    cleanText = cleanText.replace(post.og_data.url, "");
  }

  // 3. LIMPIEZA TOTAL: Quitamos cualquier otra URL que haya quedado en el texto
  // Esto evita que WhatsApp detecte links "sueltos" y cambie tu preview
  cleanText = cleanText.replace(urlRegex, "").trim();

  // 4. Acortamos el texto para el mensaje
  const finalText = cleanText.length > 100 
    ? cleanText.substring(0, 100) + "..." 
    : cleanText;

  // 5. Configuración de datos para compartir
  const shareData = {
    title: `Post de ${post.profiles?.full_name || 'YoMAC'}`,
    text: finalText || "Mira este post en YoMAC",
    url: `https://yomacv2.vercel.app/share/${post.id}` 
  };

  try {
    if (navigator.share) {
      // Truco para Android/iOS: Si el sistema se confunde, a veces es mejor 
      // mandar el link pegado al texto, pero aquí probamos con el objeto estándar:
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
      toast.success("Enlace copiado al portapapeles");
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("Error al compartir:", err);
    }
  }
};