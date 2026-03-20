export const handleShareProfile = async (profile) => {
  const shareData = {
    title: `${profile.full_name} (@${profile.username}) en YoMAC`,
    text: `Mira el perfil de ${profile.full_name} en YoMAC`,
    url: `https://yomacv2.vercel.app/share-profile/${profile.username}` // 👈 URL que apuntará a la nueva Edge Function
  };
  
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
      toast.success("Enlace del perfil copiado al portapapeles");
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("Error al compartir perfil:", err);
    }
  }
};
