import { useRef, useEffect } from "react"

/**
 * Hook that executes a callback when the component unmounts.
 *
 * @param callback Function to be called on component unmount
 */
export const useUnmount = (callback) => {
  const ref = useRef(callback)
  // Latest-ref pattern durante render (patrón documentado de React)
  // eslint-disable-next-line react-hooks/refs
  ref.current = callback

  useEffect(() => () => {
    ref.current()
  }, [])
}

export default useUnmount
