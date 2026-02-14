import { createContext, useContext, useState, useCallback } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modals, setModals] = useState([]);

  const openModal = useCallback((component) => {
    const id = crypto.randomUUID();

    setModals((prev) => [...prev, { id, component }]);

    return id;
  }, []);

  const closeModal = useCallback((id) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const closeLastModal = useCallback(() => {
    setModals((prev) => prev.slice(0, -1));
  }, []);

  return (
    <ModalContext.Provider
      value={{ modals, openModal, closeModal, closeLastModal }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
