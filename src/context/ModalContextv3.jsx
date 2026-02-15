import { createContext, useContext, useState, useCallback } from "react";
import ModalRoot from "@/components/modals/ModalRoot";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [stack, setStack] = useState([]);

  // OPEN MODAL
  const openModal = useCallback((Component, props = {}) => {
    const id = crypto.randomUUID();

    setStack((prev) => [...prev, { id, Component, props }]);

    return id;
  }, []);

  // CLOSE MODAL
  const closeModal = useCallback((id) => {
    setStack((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // PROMISE CONFIRM (ENTERPRISE API)
  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      const id = crypto.randomUUID();

      const handleClose = () => {
        closeModal(id);
        resolve(false);
      };

      const handleConfirm = () => {
        closeModal(id);
        resolve(true);
      };

      setStack((prev) => [
        ...prev,
        {
          id,
          Component: options.Component,
          props: {
            ...options,
            onClose: handleClose,
            onConfirm: handleConfirm,
          },
        },
      ]);
    });
  }, [closeModal]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal, confirm }}>
      {children}
      <ModalRoot stack={stack} />
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);