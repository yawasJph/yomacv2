import { useEffect, useState } from "react";

export function useIsMobile(maxWidth = 640) { // sm: 640px
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < maxWidth : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < maxWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [maxWidth]);

  return isMobile;
}
