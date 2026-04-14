import { useIsMobile } from "@/hooks/useIsMobile";

const ARRAY_MOBILE = [1];
const ARRAY_DESTOCK = [1, 2, 3, 4];

export function getInitSkeletons() {
  const isMobile = useIsMobile();
  const initSkeleton = isMobile ? ARRAY_MOBILE : ARRAY_DESTOCK;
  return initSkeleton;
}
