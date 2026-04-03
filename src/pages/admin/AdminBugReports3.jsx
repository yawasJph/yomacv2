import {
  Bug,
  MessageSquarePlus,
  CheckCircle,
  Loader2,
  ChevronRight,
  ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useIsMobile } from "@/hooks/useIsMobile";
import { es } from "date-fns/locale";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReportBugModal from "./ReportBugModal";
import { useBugReport } from "@/hooks/bugs-report/useBugReport";

const AdminBugReports = () => {
  const isMobile = useIsMobile();
  const [selectedReport, setSelectedReport] = useState(null);
  const navigate = useNavigate();
  const { reports, isLoading, isError } = useBugReport();

  const formatDate = (date) => {
    const d = new Date(date);
    return isMobile
      ? format(d, "HH:mm")
      : formatDistanceToNow(d, { addSuffix: true, locale: es });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500 text-center border border-red-200 rounded-xl bg-red-50">
        Error cargando los reportes.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 sm:p-6">
      
      {/* HEADER PRO */}
      <div className="sticky top-[57px] z-30 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-xl border-b border-gray-100 dark:border-neutral-800 p-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition"
        >
          <ArrowLeft size={20} className="dark:text-white" />
        </button>

        <div>
          <h1 className="text-xl font-semibold tracking-tight dark:text-white">
            Reportes
          </h1>
          <p className="text-xs text-gray-500">
            Feedback de usuarios
          </p>
        </div>
      </div>

      {/* EMPTY STATE */}
      {reports.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl">
          <CheckCircle className="mx-auto text-emerald-500 mb-3" size={40} />
          <p className="text-lg font-medium dark:text-white">Todo al día</p>
          <p className="text-gray-500">
            No hay reportes pendientes.
          </p>
        </div>
      ) : (
        reports.map((report) => {
          const isBug = report.category === "bug";
          const hasMedia = !!report.image_url;
          const isOpen = report.status !== "closed";

          return (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="group flex items-start gap-3 p-4 bg-white dark:bg-neutral-900/80 backdrop-blur-sm border border-gray-100 dark:border-neutral-800 rounded-2xl cursor-pointer hover:shadow-md hover:-translate-y-px transition-all"
            >
              {/* ICON */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5 dark:ring-white/5 ${
                  isBug
                    ? "bg-red-50 dark:bg-red-500/10 text-red-500"
                    : "bg-purple-50 dark:bg-purple-500/10 text-purple-500"
                }`}
              >
                {isBug ? <Bug size={20} /> : <MessageSquarePlus size={20} />}
              </div>

              {/* CONTENT */}
              <div className="flex-1 min-w-0">
                
                {/* TOP META */}
                <div className="flex items-center gap-2 flex-wrap">
                  
                  {/* TYPE */}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isBug
                        ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                        : "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
                    }`}
                  >
                    {isBug ? "Bug" : "Idea"}
                  </span>

                  {/* STATUS */}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isOpen
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    }`}
                  >
                    {isOpen ? "Pendiente" : "Resuelto"}
                  </span>

                  {/* TIME */}
                  <span className="text-[10px] text-gray-400">
                    {formatDate(report.created_at)}
                  </span>
                </div>

                {/* DESCRIPTION */}
                <p className="text-sm font-semibold dark:text-white mt-1 flex items-start gap-1.5 line-clamp-2">
                  {hasMedia && (
                    <ImageIcon size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  )}
                  {report.description ? (
                    <span className="line-clamp-2">{report.description}</span>
                  ) : (
                    <span className="text-gray-400 italic font-normal">
                      Solo contenido multimedia
                    </span>
                  )}
                </p>

                {/* USER */}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    {report.profiles?.full_name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    @{report.profiles?.username}
                  </span>
                </div>
              </div>

              {/* ARROW */}
              <ChevronRight
                size={18}
                className="opacity-40 group-hover:opacity-100 transition text-gray-400"
              />
            </div>
          );
        })
      )}

      {/* MODAL */}
      {selectedReport && (
        <ReportBugModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};

export default AdminBugReports;