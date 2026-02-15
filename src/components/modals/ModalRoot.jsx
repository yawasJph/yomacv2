import { createPortal } from "react-dom";
import { useEffect } from "react";

export default function ModalRoot({ stack }) {
  // Scroll lock inteligente (solo si hay modales)
  useEffect(() => {
    if (!stack.length) {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      return;
    }

    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [stack.length]);

  if (!stack.length) return null;

  return createPortal(
    <div className="">
      {stack.map(({ id, Component, props }, index) => (
        <Component key={id} {...props} index={index} />
      ))}
    </div>,
    document.body
  );
}