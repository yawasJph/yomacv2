import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}) {
  // cerrar con ESC
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center" 
    onClick={e => e.stopPropagation()}>
      
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-[92%] max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl animate-in zoom-in-95 fade-in duration-200 border border-gray-200 dark:border-zinc-700">

        {/* HEADER */}
        <div className="p-6 pb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>

        {/* MESSAGE */}
        <div className="px-6 pb-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {message}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 pb-6">

          {/* CANCEL */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
          >
            Cancelar
          </button>

          {/* CONFIRM */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isLoading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
