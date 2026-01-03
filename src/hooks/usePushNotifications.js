// hooks/usePushNotifications.js
import { supabaseClient } from "../supabase/supabaseClient";
import { useAuth } from "../context/AuthContext";

export const usePushNotifications = () => {
  const { user } = useAuth();

  const subscribeToPush = async () => {
    console.log("1. Iniciando suscripción...");
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error("Service Worker no soportado");
      }
      
      const registration = await navigator.serviceWorker.ready;
      console.log("2. Service Worker listo.");
      
      // Verifica si ya hay una suscripción activa
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BCQUCSKlyz9Eux_zMFAyUYGr-TY7Pfqm_IW3l1sOS9zZJsum8IPYR0UtwBj01rIlp0bsUPR1a_FJ7Srl1f9gWKU'
        });
      }
      console.log("3. Suscripción obtenida del navegador.");

      const { error } = await supabaseClient
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          subscription: subscription.toJSON()
        });

      if (error) throw error;
      return true;

    } catch (error) {
      console.error("Error detallado:", error);
      // Esto te ayudará a ver el error real en el móvil si no tienes inspector
      // alert("Error: " + error.message); 
      throw error;
    }
  };

  return { subscribeToPush };
};