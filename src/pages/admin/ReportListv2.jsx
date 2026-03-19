import { ChevronRight, MessageSquare, LayoutList, Paperclip } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useUrgentReports } from "@/hooks/admin/useUrgentReports";
import { useIsMobile } from "@/hooks/useIsMobile";

const ReportList = ({ onSelect }) => {
  const { data: reports, isLoading } = useUrgentReports();
  const isMobile = useIsMobile();

  const formatDate = (date) => {
    const d = new Date(date);
    return isMobile
      ? format(d, "HH:mm")
      : formatDistanceToNow(d, { addSuffix: true, locale: es });
  };

  if (isLoading)
    return (
      <div className="space-y-3">
        {/* Renderizamos 3 skeletons para simular la lista */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-neutral-800 animate-pulse rounded-3xl" />
        ))}
      </div>
    );

  if (reports?.length === 0)
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-gray-500 font-medium">
          ¡Todo limpio! No hay reportes pendientes.
        </p>
      </div>
    );

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        // Variables auxiliares para limpiar el JSX
        const isPost = !!report.post_id;
        const targetAuthor = report.post?.author?.full_name || report.comment?.author?.full_name;
        const textContent = report.post?.content || report.comment?.content;
        const hasMedia = report.post?.post_media?.length > 0;

        return (
          <div
            key={report.id}
            onClick={() => onSelect(report)} // 👈 Ahora TODO el card es clicable
            className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 cursor-pointer hover:border-gray-200 dark:hover:border-neutral-700 hover:shadow-sm active:scale-[0.98] transition-all"
          >
            {/* Icono Principal (Cambié ImageIcon por LayoutList para Posts en general) */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isPost
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-500"
                  : "bg-purple-50 dark:bg-purple-500/10 text-purple-500"
              }`}
            >
              {isPost ? <LayoutList size={22} /> : <MessageSquare size={22} />}
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

              {/* Contenido + Indicador de Media */}
              <p className="text-sm font-bold dark:text-white truncate mt-1 flex items-center gap-1.5">
                {hasMedia && <Paperclip size={14} className="text-blue-500 shrink-0" />}
                {textContent ? (
                  <span>{textContent}</span>
                ) : (
                  <span className="text-gray-400 italic font-normal">Solo contenido multimedia</span>
                )}
              </p>

              {/* Autores involucrados */}
              <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {report.reporter?.full_name}
                </span>
                {" reportó a "}
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {targetAuthor || "Usuario desconocido"}
                </span>
              </p>
            </div>

            <div className="p-2 bg-gray-50 dark:bg-neutral-800 rounded-xl text-gray-400 shrink-0">
              <ChevronRight size={18} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportList;