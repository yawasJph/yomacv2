import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { supabaseClient } from "../../supabase/supabaseClient";

const REPORT_REASONS = [
  "Contenido inapropiado",
  "Acoso o incitación al odio",
  "Spam o contenido engañoso",
  "Información falsa",
  "Infracción de derechos de autor",
  "Otro",
];

const MAX_CHARS = 500;

const ReportModal = ({ isOpen, onClose, postId, commentId }) => {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return toast.error("Por favor selecciona una razón");

    setIsSubmitting(true);
    try {
      const { error } = await supabaseClient.from("reports").insert({
        reporter_id: user.id,
        post_id: postId || null,
        comment_id: commentId || null,
        reason,
        details,
      });

      if (error) throw error;

      toast.success("Reporte enviado correctamente. Gracias por ayudarnos.");
      onClose();
    } catch (error) {
      toast.error("Error al enviar el reporte");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}>
      <div
        className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      
      >
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800">
          <h3 className="font-bold text-lg flex items-center gap-2 text-black dark:text-white">
            <AlertTriangle className="text-amber-500" size={20} />
            Reportar contenido
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-black dark:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            ¿Por qué quieres reportar esta publicación? Tu reporte es anónimo.
          </p>

          <div className="space-y-2 mb-4">
            {REPORT_REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  reason === r
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                    : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  className="hidden"
                  onChange={() => setReason(r)}
                />
                <span
                  className={`text-sm font-medium ${
                    reason === r
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {r}
                </span>
              </label>
            ))}
          </div>

          <textarea
            className="w-full p-3 text-sm dark:text-white/90 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            placeholder="Más detalles (opcional)..."
            rows="3"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={MAX_CHARS}
          />

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason}
              className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Enviando..." : "Enviar Reporte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
