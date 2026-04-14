import { useEffect, useState } from "react";

export function useIsMobile(maxWidth = 640) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${maxWidth}px)`);

    const handleChange = (e) => {
      setIsMobile(e.matches);
    };

    // Set inicial correcto
    setIsMobile(mediaQuery.matches);

    // Listener moderno
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [maxWidth]);

  return isMobile;
}