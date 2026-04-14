import { notify } from "../toast/notifyv3";

export const handleShareBlog = async ({post}) => {
    // Construimos la URL usando tu nuevo redirect
    const shareUrl = `${window.location.origin}/share-blog/${post.slug}`;

    // Si está en un móvil, usar el menú nativo de compartir (WhatsApp, Instagram, etc)
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          //text: `Echa un vistazo a este artículo de ${post.author?.full_name}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log("El usuario canceló el share o hubo un error:", err);
      }
    } else {
      // Si está en PC, copiar al portapapeles
      try {
        await navigator.clipboard.writeText(shareUrl);
        notify.success("¡Enlace copiado al portapapeles!");
      } catch (err) {
        notify.error("No se pudo copiar el enlace");
      }
    }
  };