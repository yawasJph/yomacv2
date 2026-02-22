import { forwardRef, useCallback, useEffect, useRef, useState } from "react"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
// import "@/components/tiptap-ui-primitive/toolbar/toolbar.scss" // <--- ¡Comenta esto para probar!
import { cn } from "@/lib/tiptap-utils"
import { useMenuNavigation } from "@/hooks/use-menu-navigation"
import { useComposedRef } from "@/hooks/use-composed-ref"

// --- CONSTANTES DE ESTILO TAILWIND ---
const TOOLBAR_STYLES = {
  base: "flex items-center gap-1 p-1 transition-all ",
  fixed: cn("sticky -top-1 z-30 w-full bg-white dark:bg-black border-b border-gray-200 flex-wrap"), 
  floating: "rounded-lg border border-gray-200 bg-white shadow-lg p-2"
};

const GROUP_STYLES = "flex items-center gap-0.5 flex-wrap";
const SEPARATOR_STYLES ="h-6 w-[1px] bg-gray-200";

// --- HOOK DE NAVEGACIÓN (Sin cambios lógicos) ---
const useToolbarNavigation = (toolbarRef) => {
  const [items, setItems] = useState([])
  const collectItems = useCallback(() => {
    if (!toolbarRef.current) return []
    return Array.from(toolbarRef.current.querySelectorAll(
      'button:not([disabled]), [role="button"]:not([disabled]), [tabindex="0"]:not([disabled])'
    ));
  }, [toolbarRef])

  useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return
    const updateItems = () => setItems(collectItems())
    updateItems()
    const observer = new MutationObserver(updateItems)
    observer.observe(toolbar, { childList: true, subtree: true })
    return () => observer.disconnect();
  }, [collectItems, toolbarRef])

  const { selectedIndex } = useMenuNavigation({
    containerRef: toolbarRef,
    items,
    orientation: "horizontal",
    onSelect: (el) => el.click(),
    autoSelectFirstItem: false,
  })

  useEffect(() => {
    if (selectedIndex !== undefined && items[selectedIndex]) {
      items[selectedIndex].focus()
    }
  }, [selectedIndex, items])
}

// --- COMPONENTES EXPORTADOS ---

export const Toolbar = forwardRef(({ children, className, variant = "fixed", ...props }, ref) => {
  const toolbarRef = useRef(null)
  const composedRef = useComposedRef(toolbarRef, ref)
  useToolbarNavigation(toolbarRef)

  return (
    <div
      ref={composedRef}
      role="toolbar"
      aria-label="toolbar"
      data-variant={variant}
      className={cn(
        TOOLBAR_STYLES.base,
        variant === "fixed" ? TOOLBAR_STYLES.fixed : TOOLBAR_STYLES.floating,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
})
Toolbar.displayName = "Toolbar"

export const ToolbarGroup = forwardRef(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    className={cn(GROUP_STYLES, className)}
    {...props}
  >
    {children}
  </div>
))
ToolbarGroup.displayName = "ToolbarGroup"

export const ToolbarSeparator = forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(SEPARATOR_STYLES, className)} 
    {...props} 
  />
))
ToolbarSeparator.displayName = "ToolbarSeparator"