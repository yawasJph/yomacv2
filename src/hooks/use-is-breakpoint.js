import { useSyncExternalStore } from "react"

/**
 * Hook to detect whether the current viewport matches a given breakpoint rule.
 * Example:
 *   useIsBreakpoint("max", 768)   // true when width < 768
 *   useIsBreakpoint("min", 1024)  // true when width >= 1024
 */
function getQuery(mode = "max", breakpoint = 768) {
  return mode === "min"
    ? `(min-width: ${breakpoint}px)`
    : `(max-width: ${breakpoint - 1}px)`
}

export function useIsBreakpoint(
  mode = "max",
  breakpoint = 768
) {
  const query = getQuery(mode, breakpoint)

  return useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onStoreChange)
      return () => mql.removeEventListener("change", onStoreChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}