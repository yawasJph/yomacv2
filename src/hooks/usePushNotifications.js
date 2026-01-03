// hooks/usePushNotifications.js
import { supabaseClient } from "../supabase/supabaseClient";
import { useAuth } from "../context/AuthContext";

// export const usePushNotifications = () => {
//   const { user } = useAuth();

//   const subscribeToPush = async () => {
//     if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
//       console.warn("Las notificaciones Push no son soportadas en este navegador.");
//       return;
//     }

//     try {
//       // 1. Pedir permiso
//       const permission = await Notification.requestPermission();
//       if (permission !== 'granted') {
//         console.warn("Permiso de notificación denegado.");
//         return;
//       }

//       // 2. Obtener el registro del Service Worker
//       const registration = await navigator.serviceWorker.ready;

//       // 3. Suscribirse al servidor push del navegador
//       // NOTA: Reemplaza 'TU_PUBLIC_VAPID_KEY' por la que generaste en el paso anterior
//       const subscription = await registration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: 'BCQUCSKlyz9Eux_zMFAyUYGr-TY7Pfqm_IW3l1sOS9zZJsum8IPYR0UtwBj01rIlp0bsUPR1a_FJ7Srl1f9gWKU' 
//       });

//       // 4. Guardar en Supabase
//       const { error } = await supabaseClient
//         .from('push_subscriptions')
//         .insert({
//           user_id: user.id,
//           subscription: subscription.toJSON()
//         });

//       if (error) throw error;
//       console.log("Suscripción guardada con éxito en Supabase");

//     } catch (error) {
//       console.error("Error al suscribirse a Push:", error);
//     }
//   };

//   return { subscribeToPush };
// };
// hooks/usePushNotifications.js
export const usePushNotifications = () => {
  const { user } = useAuth();

  const subscribeToPush = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error("Service Worker no soportado");
      }
      
      const registration = await navigator.serviceWorker.ready;
      
      // Verifica si ya hay una suscripción activa
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'TU_LLAVE_PUBLICA_VAPID'
        });
      }

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