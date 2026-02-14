import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../context/ModalContext";

export default function ReportModal({ commentId }) {
  const { closeLastModal } = useModal();
  const { user } = useAuth();

  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return;

    setLoading(true);

    const { error } = await supabaseClient.from("reports").insert({
      reporter_id: user.id,
      comment_id: commentId,
      reason,
      details,
    });

    setLoading(false);

    if (error) {
      toast.error("Error al reportar");
      return;
    }

    toast.success("Reporte enviado");
    closeLastModal();
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl">
      <div className="flex justify-between p-6 border-b dark:border-gray-800">
        <h3 className="flex gap-2 font-semibold">
          <AlertTriangle className="text-amber-500" size={20} />
          Reportar contenido
        </h3>

        <button onClick={closeLastModal}>
          <X />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full p-3 border rounded-xl"
          placeholder="Detalles..."
        />

        <button
          disabled={loading}
          className="w-full py-2 bg-red-500 text-white rounded-xl"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Enviar"}
        </button>
      </form>
    </div>
  );
}
