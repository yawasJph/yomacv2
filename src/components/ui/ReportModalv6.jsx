import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabaseClient } from "../../supabase/supabaseClient";
import { notify } from "@/utils/toast/notifyv3";

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

  const modalRef = useRef(null);
  const textareaRef = useRef(null);

  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     SCROLL LOCK PROFESIONAL
  ========================= */
  useEffect(() => {
    if (!isOpen) return;

    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  /* =========================
     ESC + FOCUS TRAP
  ========================= */
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();

      // Focus trap real
      if (e.key === "Tab") {
        const focusable = modalRef.current.querySelectorAll(
          "button, input, textarea"
        );

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKey);

    // focus inicial
    setTimeout(() => modalRef.current?.querySelector("button")?.focus(), 50);

    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  /* =========================
     FOCUS TEXTAREA SI "OTRO"
  ========================= */
  useEffect(() => {
    if (reason === "Otro") {
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [reason]);

  /* =========================
     RESET AL CERRAR
  ========================= */
  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setDetails("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || loading) return;

    setLoading(true);

    try {
      const { error } = await supabaseClient.from("reports").insert({
        reporter_id: user?.id,
        post_id: postId,
        comment_id: commentId,
        reason,
        details,
      });

      if (error) {
        if (error.code === "23505") {
          notify.info("Ya reportaste este contenido");
          onClose();
          return;
        }
        throw error;
      }

      notify.success("Reporte enviado correctamente");
      onClose();
    } catch (error) {
      notify.error("Error al enviar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={(e) => e.stopPropagation()}
    >
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        ref={modalRef}
        className="relative w-full sm:max-w-md bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in duration-300"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800">
          <h3 className="flex items-center gap-2 font-semibold text-lg">
            <AlertTriangle className="text-amber-500" size={20} />
            Reportar contenido
          </h3>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-sm text-gray-500">
            Selecciona el motivo del reporte:
          </p>

          {/* REASONS */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
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
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-emerald-500"
                />
                <span className="text-sm font-medium">{r}</span>
              </label>
            ))}
          </div>

          {/* TEXTAREA */}
          <div>
            <textarea
              ref={textareaRef}
              rows="3"
              maxLength={MAX_CHARS}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Añade detalles adicionales (opcional)"
              className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition"
            />

            <div className="text-xs text-gray-400 text-right mt-1">
              {details.length}/{MAX_CHARS}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!reason || loading}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar reporte"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
