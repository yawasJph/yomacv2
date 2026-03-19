import { ChevronRight, MessageSquare, Image as ImageIcon } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useUrgentReports } from "@/hooks/admin/useUrgentReports";
import { useIsMobile } from "@/hooks/useIsMobile";

const ReportList = ({ onSelect }) => {
  const { data: reports, isLoading } = useUrgentReports();
  const isMobile = useIsMobile()

  const formatDate = (date) => {
    const d = new Date(date);
    return isMobile
      ? format(d, "HH:mm") // 🔥 compacto
      : formatDistanceToNow(d, {
          addSuffix: true,
          locale: es,
        });
  };

  if (isLoading)
    return (
      <div className="p-4 space-y-3">
        <div className="skeleton h-32 bg-gray-100 dark:bg-neutral-800 animate-pulse rounded-3xl" />
      </div>
    );

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div
          key={report.id}
          className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 active:scale-[0.98] transition-transform"
        >
          {/* Icono según tipo de contenido reportado */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              report.post_id
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-500"
                : "bg-purple-50 dark:bg-purple-500/10 text-purple-500"
            }`}
          >
            {report.post_id ? (
              <ImageIcon size={22} />
            ) : (
              <MessageSquare size={22} />
            )}
          </div>

          {/* Información del reporte */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded">
                {report.reason}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                 {formatDate(report.created_at)}
              </span>
            </div>

            <p className="text-sm font-bold dark:text-white truncate mt-1">
              {report.post?.content ||
                report.comment?.content ||
                "Sin contenido de texto"}
            </p>

            <p className="text-[10px] text-gray-500">
              Reportado por{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {report.reporter?.full_name}
              </span>
            </p>
          </div>

          <button
            className="p-2 bg-gray-50 dark:bg-neutral-800 rounded-xl text-gray-400"
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
