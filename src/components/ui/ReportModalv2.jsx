import { useEffect, useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { createPortal } from "react-dom";

const REPORT_REASONS = [
  "Contenido inapropiado",
  "Acoso o incitación al odio",
  "Spam o contenido engañoso",
  "Información falsa",
  "Infracción de derechos de autor",
  "Otro",
];

const MAX_CHARS = 500;

export default function ReportModal({
  isOpen,
  onClose,
  postId = null,
  commentId = null,
}) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Bloquear scroll del body
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  // 🔹 Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      toast.error("Selecciona un motivo");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabaseClient.from("reports").insert({
        reporter_id: user?.id,
        post_id: postId,
        comment_id: commentId,
        reason,
        details,
      });

      if (error) throw error;

      toast.success("Reporte enviado correctamente");
      setReason("");
      setDetails("");
      onClose();
    } catch (err) {
      toast.error("No se pudo enviar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl animate-in zoom-in"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800">
          <h3 className="flex items-center gap-2 font-semibold text-lg">
            <AlertTriangle className="text-amber-500" size={20} />
            Reportar contenido
          </h3>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ¿Cuál es el motivo del reporte?
          </p>

          {/* MOTIVOS */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {REPORT_REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  reason === r
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-emerald-500"
                />
                <span className="text-sm font-medium">{r}</span>
              </label>
            ))}
          </div>

          {/* DETALLES */}
          <div>
            <textarea
              id="report-details"
              name="details"
              rows="3"
              maxLength={MAX_CHARS}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Añade más detalles (opcional)"
              className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            />

            <div className="text-xs text-gray-400 text-right mt-1">
              {details.length}/{MAX_CHARS}
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!reason || loading}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enviando
                </>
              ) : (
                "Enviar reporte"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
