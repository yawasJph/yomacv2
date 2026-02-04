import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { useState } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { SplineIcon } from "lucide-react";

// Inicializa con tu Public Key de prueba
initMercadoPago(import.meta.env.VITE_MP_API_KEY);

const BuyCoins = () => {
  const { user } = useAuth();
  const [preferenceId, setPreferenceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const createPreference = async (amount, coins) => {
    setIsLoading(true);
    setPreferenceId(null);
    try {
      // 1. Creamos el registro 'pending' en nuestra tabla de pagos
      const { data: payment, error: dbError } = await supabaseClient
        .from("payments")
        .insert([
          {
            user_id: user?.id,
            amount: amount,
            coins_amount: coins,
            provider: "mercado_pago",
            status: "pending",
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // 2. Llamamos a una Edge Function (que crearemos luego)
      // para generar el ID de preferencia de Mercado Pago
      const response = await fetch(
        "https://vrbfinqvtyclfmvhheub.supabase.co/functions/v1/create-preference",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // AÑADE ESTO:
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            orderId: payment.id,
            amount: amount,
            title: `${coins} YoMACcoins`,
          }),
        },
      );

      //const { id } = await response.json();
      //setPreferenceId(id);
      const result = await response.json(); // Cambia esto para inspeccionar el objeto completo

      if (response.ok && result.id) {
        setPreferenceId(result.id);
      } else {
        console.error("Error detallado de la Función:", result);
        alert(
          "Error al generar el pago: " + (result.error || "Revisa la consola"),
        );
      }
    } catch (error) {
      console.error("Error al crear preferencia:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5">
      <h3 className="text-xl font-bold mb-4 text-black dark:text-white">
        Recargar YoMACcoins
      </h3>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => createPreference(5.0, 500)}
          disabled={isLoading}
          className="p-4 border-2 border-emerald-500 rounded-2xl hover:bg-emerald-500 transition-colors text-black dark:text-white"
        >
          {isLoading ? <SplineIcon className="animate-spin"/> : "Pack Estudiante: 500 coins - S/ 5.00"}  
        </button>
      </div>

      {preferenceId && (
        <div className="mt-6">
          <Wallet
            initialization={{ preferenceId }}
            customization={{ texts: { valueProp: "smart_option" } }}
          />
        </div>
      )}
    </div>
  );
};

export default BuyCoins;
