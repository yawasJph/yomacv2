import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/supabase/supabaseClient";
import { notify } from "@/utils/toast/notifyv3";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useDeleteUser = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { signout } = useAuth();
  const navigate = useNavigate();

  const deleteUser = async () => {
    setIsDeleting(true);
    try {
      // Invocamos la Edge Function
      const { error } = await supabaseClient.functions.invoke(
        "delete-user-account",
      );

      if (error) throw error;

      // Si tienes un sistema de notificaciones
      notify.success("Cuenta eliminada exitosamente");

      // Cerramos sesión localmente y redirigimos
      await signout();
      navigate("/");
    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
      notify.error("Hubo un problema al eliminar la cuenta.");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteUser,
    isDeleting,
  };
};
