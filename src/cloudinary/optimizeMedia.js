export const optimizeMedia = (url, type, width = 800) => {
  if (!url.includes("cloudinary")) return url;

  if (type === "image") {
    return url.replace(
      "/upload/",
      `/upload/f_auto,q_auto,c_limit,w_${width}/`
    );
  }

  if (type === "video") {
    return url.replace(
      "/upload/",
      `/upload/f_auto,q_auto/`
    );
  }

  return url;
};