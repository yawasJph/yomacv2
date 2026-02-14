import { createPortal } from "react-dom";
import { useEffect } from "react";
import { useModal } from "../../context/ModalContext";

export default function ModalRoot() {
  const { modals, closeLastModal } = useModal();

  /* ESC GLOBAL */
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && closeLastModal();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [closeLastModal]);

  /* SCROLL LOCK GLOBAL */
  useEffect(() => {
    if (modals.length > 0) {
      const width =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${width}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [modals.length]);

  if (!modals.length) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999">
      {modals.map(({ id, component }, index) => (
        <div
          key={id}
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 1000 + index }}
        >
          {/* BACKDROP */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

          {/* MODAL */}
          <div className="relative animate-in zoom-in duration-300">
            {component}
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
}
