import { ChevronRight, MessageSquare, Image as ImageIcon } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { useUrgentReports } from "@/hooks/admin/useUrgentReports";
import { useIsMobile } from "@/hooks/useIsMobile";

const ReportList = ({ onSelect }) => {
  const { data: reports, isLoading } = useUrgentReports();
  const isMobile = useIsMobile()

  if (isLoading)
    return (
      <div className="p-4 space-y-3">
        <div className="h-28 bg-gray-100 dark:bg-neutral-800 animate-pulse rounded-3xl" />
      </div>
    );

  const formatDate = (date) => {
    const d = new Date(date);
    return isMobile
      ? format(d, "HH:mm") // 🔥 compacto
      : formatDistanceToNow(d, {
          addSuffix: true,
          locale: es,
        });
  };

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div
          key={report.id}
          className="flex items-start gap-3 p-4 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 active:scale-[0.98] transition-transform"
        >
          {/* Icono */}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              report.post_id
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-500"
                : "bg-purple-50 dark:bg-purple-500/10 text-purple-500"
            }`}
          >
            {report.post_id ? (
              <ImageIcon size={20} />
            ) : (
              <MessageSquare size={20} />
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md">
                {report.reason}
              </span>

              <span className="text-[10px] text-gray-400 shrink-0">
                {formatDate(report.created_at)}
              </span>
            </div>

            {/* Texto */}
            <p className="text-sm font-semibold dark:text-white mt-1 line-clamp-2">
              {report.post?.content ||
                report.comment?.content ||
                "Sin contenido de texto"}
            </p>

            {/* Usuario */}
            <p className="text-[11px] text-gray-500 mt-1">
              Reportado por{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {report.reporter?.full_name}
              </span>
            </p>
          </div>

          {/* Acción */}
          <button
            className="p-2 bg-gray-50 dark:bg-neutral-800 rounded-xl text-gray-400 shrink-0"
            onClick={() => onSelect(report)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ))}

      {reports.length === 0 && (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-500 font-medium">
            ¡Todo limpio! No hay reportes pendientes.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportList;