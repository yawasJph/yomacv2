import { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modals, setModals] = useState([]);

  /* =========================
     OPEN MODAL
  ========================= */
  const openModal = useCallback((Component, props = {}) => {
    const id = crypto.randomUUID();

    setModals((prev) => [...prev, { id, Component, props }]);

    return id;
  }, []);

  /* =========================
     CLOSE MODAL
  ========================= */
  const closeModal = useCallback((id) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  /* =========================
     SCROLL LOCK GLOBAL
  ========================= */
  const hasModals = modals.length > 0;

  if (hasModals) {
    console.log("Modal abierto, bloqueando scroll");
    document.body.style.overflow = "hidden";
  } else {
    console.log("No hay modales abiertos, desbloqueando scroll");
    document.body.style.overflow = "";
  }

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {/* PORTAL ROOT */}
      {createPortal(
        <div className="fixed inset-0 z-9999 pointer-events-none">
          {modals.map(({ id, Component, props }, index) => (
            <Component
              key={id}
              modalId={id}
              close={() => closeModal(id)}
              style={{ zIndex: 1000 + index }}
              {...props}
            />
          ))}
        </div>,
        document.body
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
