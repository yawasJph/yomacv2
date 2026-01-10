import { createContext, useContext, useState } from "react";

const AuthModalContext = createContext();

export const AuthModalProvider = ({ children }) => {
  const [open, setOpen] = useState(false);

  const openAuthModal = () => setOpen(true);
  const closeAuthModal = () => setOpen(false);

  return (
    <AuthModalContext.Provider
      value={{ open, openAuthModal, closeAuthModal }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
