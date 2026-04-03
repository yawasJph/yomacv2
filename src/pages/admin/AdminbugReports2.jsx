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

const statusStyles = {
  pendiente:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  en_revision:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  revisado:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
};

const AdminBugReports = () => {
  const isMobile = useIsMobile();
  const [selectedReport, setSelectedReport] = useState(null);
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState("all"); // all | bug | idea
  const [statusFilter, setStatusFilter] = useState("all"); // all | open | closed
  const { reports, isLoading, isError } = useBugReport({
    category: typeFilter,
    status: statusFilter,
  });

  const formatDate = (date) => {
    const d = new Date(date);
    return isMobile
      ? format(d, "HH:mm")
      : formatDistanceToNow(d, { addSuffix: true, locale: es });
  };

  const filteredReports = reports?.filter((report) => {
    if (typeFilter !== "all" && report.category !== typeFilter) {
      return false;
    }

    if (statusFilter !== "all" && report.status !== statusFilter) {
      return false;
    }

    return true;
  });

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
    <div className="space-y-4 p-2 sm:p-5">
      <div className="sticky top-[57px] z-30 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-xl p-2 flex items-center gap-6 border-b border-transparent">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-black dark:text-white">
            Reportes y Sugerencias
          </h1>
          <p className="text-sm text-gray-500">
            Gestiona el feedback de los usuarios de YoMAC.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* CATEGORY */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "Todos" },
            { key: "bug", label: "Bugs" },
            { key: "suggestion", label: "Sugerencias" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTypeFilter(item.key)}
              className={`px-3 py-1.5 text-xs rounded-full border transition ${
                typeFilter === item.key
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* STATUS */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "Todos" },
            { key: "pendiente", label: "Pendientes" },
            { key: "en_revision", label: "En revisión" },
            { key: "revisado", label: "Resueltos" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`px-3 py-1.5 text-xs rounded-full border transition ${
                statusFilter === item.key
                  ? "bg-emerald-500 text-white"
                  : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl ">
          <CheckCircle className="mx-auto text-emerald-500 mb-3" size={40} />
          <p className="text-lg font-medium dark:text-white">¡Todo al día!</p>
          <p className="text-gray-500">
            No hay reportes pendientes en este momento.
          </p>
        </div>
      ) : (
        filteredReports.map((report) => {
          // Variables auxiliares para limpiar el JSX
          const isBug = report.category === "bug";
          const hasMedia = !!report.image_url;
          const isPending = report.status === "pendiente";

          return (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)} // 👈 Ahora TODO el card es clicable
              className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-900/80 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-neutral-800 cursor-pointer hover:border-gray-200 dark:hover:border-neutral-700 hover:shadow-md hover:-translate-y-px active:scale-[0.98] transition-all"
            >
              {/* Icono Principal (Cambié ImageIcon por LayoutList para Posts en general) */}
              <div
                className={`w-11 h-11 shadow-sm ring-1 ring-black/5 dark:ring-white/5 rounded-2xl flex items-center justify-center shrink-0 ${
                  isBug
                    ? "bg-red-50 dark:bg-red-500/10 text-red-500"
                    : "bg-purple-50 dark:bg-purple-500/10 text-purple-500"
                }`}
              >
                {isBug ? <Bug size={22} /> : <MessageSquarePlus size={22} />}
              </div>

              {/* Información del reporte */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isBug
                        ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                        : "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
                    }`}
                  >
                    {isBug ? "Error" : "Idea"}
                  </span>
                  {/* STATUS */}
                  {/* <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isPending
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    }`}
                  >
                    {isPending ? "Pendiente" : "Resuelto"}
                  </span> */}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${statusStyles[report.status]}`}
                  >
                    {report.status === "pendiente" && "Pendiente"}
                    {report.status === "en_revision" && "En revisión"}
                    {report.status === "revisado" && "Resuelto"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {formatDate(report.created_at)}
                  </span>
                </div>

                {/* Contenido + Indicador de Media */}
                <p className="text-sm font-bold dark:text-white mt-1 flex items-center gap-1.5 line-clamp-2">
                  {hasMedia && (
                    <ImageIcon size={14} className="text-blue-500 shrink-0" />
                  )}
                  {report.description ? (
                    <span className="line-clamp-3">{report.description} </span>
                  ) : (
                    <span className="text-gray-400 italic font-normal">
                      Solo contenido multimedia
                    </span>
                  )}
                </p>

                {/* Autores involucrados */}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    {report.profiles?.full_name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    @{report.profiles?.username}
                  </span>
                </div>
              </div>

              <div className="p-2 bg-gray-50 dark:bg-neutral-800 rounded-xl text-gray-400 shrink-0">
                <ChevronRight size={18} />
              </div>
            </div>
          );
        })
      )}

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
