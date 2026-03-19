import { useBanUser } from "@/hooks/admin/useBanUser";
import { useResolveReport } from "@/hooks/admin/useResolveReport";
import { CheckCircle2, XCircle, Trash2, Ban } from "lucide-react";

const ReportManagementModal = ({ report, onClose }) => {
  if (!report) return null;

  const { mutate: resolve, isLoading } = useResolveReport();
  const { mutate: ban, isPending: isBanning } = useBanUser();
  const targetId = report.post ? report.post.id : report.comment.id;
  const targetContectType = report.post ? "post" : "comment";
  const authorId = report.post
    ? report.post.author.id
    : report.comment.author.id;

  // Helper para ejecutar acciones
  const handleAction = (status, action = null) => {
    resolve(
      {
        reportId: report.id,
        status: status,
        contentId: targetId,
        contentType: targetContectType,
        action: action,
      },
      {
        onSuccess: () => onClose(), // Cerrar el modal al terminar
      },
    );
  };

  const handleBan = ({ userId, reason }) => {
    ban(
      {
        userId: userId,
        reason: reason,
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  console.log(report.post.author.id);
  return (
    <div className="fixed inset-0 z-150 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Tap to close overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-t-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Handle de arrastre (visual) */}
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-neutral-800 rounded-full mx-auto mb-6" />

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-3 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black rounded-full uppercase">
                {report.reason}
              </span>
              <h2 className="text-xl font-black dark:text-white mt-2">
                Gestionar Reporte
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full text-gray-400"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-3xl border border-gray-100 dark:border-neutral-800">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">
              Contenido Reportado:
            </p>
            <p className="text-sm italic dark:text-gray-300">
              "{report.post?.content || report.comment?.content}"
            </p>
          </div>

          {/* Grid de Acciones de Moderación */}
          <div className="grid grid-cols-2 gap-4">
            <button
              disabled={isLoading}
              onClick={() => handleAction("resolved")}
              className="flex flex-col items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-3xl font-bold transition-all active:scale-95"
            >
              <CheckCircle2 size={28} />
              <span className="text-[10px] uppercase">Resolver</span>
            </button>

            <button
              disabled={isLoading}
              onClick={() => handleAction("dismissed")}
              className="flex flex-col items-center gap-2 p-4 bg-gray-100 dark:bg-neutral-800 text-gray-500 rounded-3xl font-bold transition-all active:scale-95"
            >
              <XCircle size={28} />
              <span className="text-[10px] uppercase">Ignorar</span>
            </button>

            <button
              className="flex flex-col items-center gap-2 p-4 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-3xl font-bold transition-all active:scale-95"
              disabled={isLoading}
              onClick={() => handleAction("resolved", "delete")}
            >
              <Trash2 size={28} />
              <span className="text-[10px] uppercase">Borrar Contenido</span>
            </button>

            {/* <button
              className="flex flex-col items-center gap-2 p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-3xl font-bold transition-all active:scale-95"
              disabled={isLoading}
              onClick={() =>
                handleBan({
                  userId: authorId,
                  reason: "Imcumplientos de Normas",
                })
              }
            >
              <Ban size={28} />
              <span className="text-[10px] uppercase">Banear Autor</span>
            </button> */}

            <button
              className="flex flex-col items-center gap-2 p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-3xl font-bold transition-all active:scale-95 disabled:opacity-50"
              disabled={isLoading || isBanning} // 👈 Deshabilitar si cualquier acción carga
              onClick={() => {
                if (
                  window.confirm(
                    "¿Estás seguro de banear permanentemente a este usuario?",
                  )
                ) {
                  handleBan({
                    userId: authorId,
                    reason: `Reporte: ${report.reason}`,
                  });
                }
              }}
            >
              {isBanning ? (
                <div className="w-7 h-7 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Ban size={28} />
              )}
              <span className="text-[10px] uppercase">Banear Autor</span>
            </button>
          </div>

          <p className="text-[10px] text-center text-gray-400 font-medium">
            Al resolver un reporte, el estado cambiará en la base de datos y se
            notificará (si aplica) al reportador.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportManagementModal;
