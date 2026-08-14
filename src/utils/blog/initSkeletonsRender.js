const ARRAY_MOBILE = [1];
const ARRAY_DESTOCK = [1, 2, 3, 4];

export function getInitSkeletons(isMobile) {
  return isMobile ? ARRAY_MOBILE : ARRAY_DESTOCK;
}
