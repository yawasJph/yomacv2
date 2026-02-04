import { toast } from "sonner";

export  const handleShare = async (post) => { 
  
  const shareData = {
    title: `Post de ${post.profiles.full_name} en YoMAC`,
    text: post.content?.substring(0, 100) + "...",
    //url: `${window.location.origin}/post/${post.id}`,
    url: `https://vrbfinqvtyclfmvhheub.supabase.co/functions/v1/share-post?id=${post.id}`
  };

  try {
    // 1. Intentar usar la API nativa de compartir (Móviles)
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // 2. Fallback para escritorio: Copiar al portapapeles
      await navigator.clipboard.writeText(shareData.url);
      toast.success("Enlace copiado al portapapeles");
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("Error al compartir:", err);
      toast.error("No se pudo compartir");
    }
  }
};