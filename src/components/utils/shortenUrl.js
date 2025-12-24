
export  const shortenUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url.length > 25 ? url.substring(0, 25) + "..." : url;
    }
  };