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

  const executeAction = (callback, actionText = "realizar esta acción") => {
    if (user) {
      // Si hay usuario, ejecutamos la función que pasamos por parámetro
      callback();
    } else {
      //Si no hay usuario, redirigimos y avisamos
      // navigate("/login");
      // toast.error(`Debes iniciar sesión para ${actionText}`, {
      //   className: "shadow-lg border-l-4 border-red-600",
      //   icon: <TriangleAlertIcon className="w-5 h-5 text-red-500" />,
      // });
      // openAuthModal()
      const id = openModal(AuthModal,{
        closeModal: ()=>closeModal(id),
      });
    }
  };

  return { executeAction };
};
