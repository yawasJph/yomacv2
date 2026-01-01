import { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
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

      if (error) {
        // Capturamos el error de duplicado (Código 23505 en PostgreSQL)
        if (error.code === "23505") {
          toast.info("Ya has enviado un reporte para esta publicación.");
          onClose();
          return;
        }
        throw error;
      }

      toast.success("Reporte enviado. Gracias por tu colaboración.");
      onClose();
      setReason("");
      setDetails("");
    } catch (error) {
      tconsole.error("Error al reportar:", error);
      toast.error(
        "Hubo un problema al enviar el reporte. Inténtalo más tarde."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800">
          <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <AlertTriangle className="text-amber-500" size={20} />
            Reportar contenido
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            ¿Cuál es el motivo del reporte? Tu identidad no será revelada al
            autor.
          </p>

          <div className="space-y-2 mb-5 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
            {REPORT_REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${
                  reason === r
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                    : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  className="hidden"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                />
                <span
                  className={`text-sm font-medium ${
                    reason === r ? "text-emerald-700 dark:text-emerald-400" : ""
                  }`}
                >
                  {r}
                </span>
              </label>
            ))}
          </div>

          <textarea
            className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-400 dark:text-gray-200"
            placeholder="Puedes añadir más detalles aquí..."
            rows="3"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={MAX_CHARS}
          />

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason}
              className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enviando
                </>
              ) : (
                "Enviar Reporte"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
