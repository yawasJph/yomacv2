import { X, Eye, Edit, Clock, Loader2, Trash2 } from "lucide-react";
import { optimizeMedia } from "@/cloudinary/optimizeMedia";
import { useBugReport } from "@/hooks/bugs-report/useBugReport";
import { REPORT_BUGS } from "@/consts/bugs";

const ReportBugModal = ({ report, onClose }) => {
  if (!report) return null;
  const isBug = report.category === REPORT_BUGS.category.bug;
  const isPending = report.status === REPORT_BUGS.status.in_review;
  const isResolved = report.status === REPORT_BUGS.status.resolved;
  const { updateReport, updateLoading, deleteReport, isDeleting } = useBugReport();

  const handleAction = (id, newStatus) => {
    updateReport(
      {
        id,
        newStatus,
      },
      { onSuccess: () => onClose() },
    );
  };

  const handleDelete = (id) => {
    deleteReport(
      {
        id,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    // 🔹 En móvil se ancla abajo (items-end), en PC se centra (md:items-center)
    <div className="fixed inset-0 z-150 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
      <div className="absolute inset-0" onClick={onClose} />

      {/* 🔹 Contenedor Principal: Limita el alto máximo (90vh) y oculta el desbordamiento general */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-t-4xl md:rounded-4xl shadow-2xl flex flex-col md:flex-row animate-in slide-in-from-bottom md:zoom-in-95 duration-200 max-h-[90vh] md:max-h-[85vh] overflow-hidden">
        {/* Pill decorativo móvil y botón X */}
        <div className="flex justify-center pt-3 pb-1 md:hidden bg-white dark:bg-neutral-900 z-10 sticky top-0">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-neutral-700 rounded-full" />
          <button
            onClick={onClose}
            className="absolute top-3 right-4 p-2 bg-gray-100 dark:bg-neutral-800 rounded-full"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* 🔹 COLUMNA IZQUIERDA: Contexto del Reporte (HACE SCROLL INTERNO) */}
        <div className="flex-1 overflow-y-auto p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`px-3 py-1 text-xs font-black rounded-full uppercase
                ${isBug ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"}`}
            >
              {isBug ? REPORT_BUGS.categoryLabels.bug : REPORT_BUGS.categoryLabels.suggestion}
            </span>
          </div>

          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
            Detalles del reportador:
          </h3>
          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-4 rounded-2xl mb-6 shadow-sm">
            {/* HEADER */}
            <div className="flex items-start gap-3">
              <img
                src={
                  optimizeMedia(report.profiles.avatar, "image") ||
                  "/default-avatar.jpg"
                }
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-neutral-800"
              />

              <div className="flex-1">
                {/* Nombre + username */}
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {report.profiles.full_name}
                  </span>

                  <span className="text-sm text-gray-500">
                    @{report.profiles.username}
                  </span>
                </div>

                {/* Info académica */}
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {report.profiles.carrera}
                  </span>

                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {report.profiles.ciclo}
                  </span>
                </div>

                {/* DEVICE INFO */}

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800">
                    📱 {report.device_info.device}
                  </span>

                  <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800">
                    💻 {report.device_info.os}
                  </span>

                  <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800">
                    🌐 {report.device_info.browser}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
            Contenido a evaluar:
          </h3>
          <div className="border border-gray-200 dark:border-neutral-700 rounded-2xl p-4">
            <p className="text-base dark:text-white mb-3 whitespace-pre-line">
              {report.description}
            </p>
            {/* 🔹 RENDERIZADO DE MULTIMEDIA (IMAGEN ) */}
            {report.image_url && (
              <div className="mt-4 grid grid-cols-1 gap-3">
                <img
                  src={optimizeMedia(report.image_url, "image")}
                  alt="Contenido reportado"
                  className="w-full max-h-[400px] object-contain"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>

        {/* 🔹 COLUMNA DERECHA: Acciones del Admin (FIJA EN PC, AL FINAL DEL SCROLL EN MÓVIL) */}
        <div className="w-full md:w-[320px] p-6 flex flex-col gap-3 bg-white dark:bg-neutral-900 md:bg-gray-50/30 md:dark:bg-black/20 shrink-0">
          <h2 className="text-xl font-black dark:text-white mb-2 hidden md:block">
            Acciones
          </h2>

          <button
            disabled={updateLoading || isDeleting}
            onClick={() => handleAction(report.id, REPORT_BUGS.status.resolved)}
            className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold transition-all disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-neutral-700"
          >
            <Eye size={20} />
            <span className="text-sm">Resuelto</span>
          </button>

          <button
            disabled={updateLoading || isDeleting}
            onClick={() => handleAction(report.id, REPORT_BUGS.status.in_review)}
            className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl font-bold transition-all disabled:opacity-50 hover:bg-orange-100"
          >
            <Edit size={20} />
            <span className="text-sm">En revision</span>
          </button>

          {isPending && (
            <button
              disabled={updateLoading || isDeleting}
              onClick={() => handleAction(report.id, REPORT_BUGS.status.pending)}
              className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold transition-all disabled:opacity-50 hover:bg-indigo-100"
            >
              <Clock size={20} />
              <span className="text-sm">Pendiente</span>
            </button>
          )}

          {isResolved && (
            <button
              disabled={updateLoading || isDeleting}
              onClick={() => handleDelete(report.id)}
              className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl font-bold transition-all disabled:opacity-50 hover:bg-red-100"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span className="text-sm">Eliminando</span>
                </>
              ) : (
                <>
                  {" "}
                  <Trash2 size={20} />
                  <span className="text-sm">Eliminar</span>
                </>
              )}
            </button>
          )}

          <div className="mt-auto pt-4 md:flex justify-end hidden">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-bold hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportBugModal;
