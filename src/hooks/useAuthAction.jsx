// hooks/useAuthAction.js
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { useModal } from "@/context/ModalContextv3";
import AuthModal from "@/components/ui/AuthModal ";


export const useAuthAction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const { openModal, closeModal } = useModal();

  const executeAction = (callback, actionText = "realizar esta acción", onCancel) => {
    if (user) {
      // Si hay usuario, ejecutamos la función que pasamos por parámetro
      callback();
    } else {
      const id = openModal(AuthModal, {
        closeModal: () => {
          closeModal(id);
          if (onCancel) onCancel(); // Notifica al componente que el modal se cerró
        },
      });
    }
  };

  return { executeAction };
};
