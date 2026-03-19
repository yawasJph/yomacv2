import { useBanUser } from "@/hooks/admin/useBanUserv2";
import { useResolveReport } from "@/hooks/admin/useResolveReport";
import { XCircle, Trash2, Ban, X } from "lucide-react";
import { optimizeMedia } from "@/cloudinary/optimizeMedia";

const ReportManagementModal = ({ report, onClose }) => {
  if (!report) return null;

  const { mutate: resolve, isLoading } = useResolveReport();
  const { mutate: ban, isLoading: isBanning } = useBanUser();
  
  const targetId = report.post ? report.post.id : report.comment.id;
  const targetContectType = report.post ? "post" : "comment";
  const authorId = report.post ? report.post.author.id : report.comment.author.id;
  const mediaItems = report.post?.post_media || [];

  const handleAction = (status, action = null) => {
    resolve(
      { reportId: report.id, status, contentId: targetId, contentType: targetContectType, action },
      { onSuccess: () => onClose() }
    );
  };

  const handleBan = () => {
    if(window.confirm("¿Estás seguro de banear a este usuario permanentemente?")) {
      ban(
        { userId: authorId, reason: `Infracción: ${report.reason}` },
        { onSuccess: () => onClose() }
      );
    }
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
          <button onClick={onClose} className="absolute top-3 right-4 p-2 bg-gray-100 dark:bg-neutral-800 rounded-full">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* 🔹 COLUMNA IZQUIERDA: Contexto del Reporte (HACE SCROLL INTERNO) */}
        <div className="flex-1 overflow-y-auto p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black rounded-full uppercase">
              {report.reason}
            </span>
          </div>

          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Detalles del reportador:</h3>
          <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-2xl mb-6">
            <div className="flex items-center gap-2 mb-2">
              <img src={optimizeMedia(report.reporter.avatar, "image") || "/default-avatar.jpg"} className="w-6 h-6 rounded-full object-cover" />
              <span className="text-sm font-bold dark:text-white">{report.reporter.full_name}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 italic">
              {report.details ? `"${report.details}"` : "Sin detalles adicionales."}
            </p>
          </div>

          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Contenido a evaluar:</h3>
          <div className="border border-gray-200 dark:border-neutral-700 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <img src={optimizeMedia(report.post?.author?.avatar || report.comment?.author?.avatar, "image") || "/default-avatar.jpg"} className="w-8 h-8 rounded-full object-cover" />
              <div>
                <span className="text-sm font-bold dark:text-white block leading-tight">
                  {report.post?.author?.full_name || report.comment?.author?.full_name}
                </span>
                <span className="text-[10px] text-gray-400">Autor Reportado</span>
              </div>
            </div>

            <p className="text-base dark:text-white mb-3 whitespace-pre-line">
              {report.post?.content || report.comment?.content || <span className="text-gray-400 italic">Sin texto.</span>}
            </p>

            {/* 🔹 RENDERIZADO DE MULTIMEDIA (IMAGEN O VIDEO) */}
            {mediaItems.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-3">
                {mediaItems.map((media, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center min-h-[200px]">
                    {media.media_type === "video" ? (
                      <video 
                        src={optimizeMedia(media.media_url, media.media_type)} 
                        controls 
                        playsInline
                        className="w-full max-h-[400px] object-contain"
                      />
                    ) : (
                      <img 
                        src={optimizeMedia(media.media_url, media.media_type)} 
                        alt="Contenido reportado"
                        className="w-full max-h-[400px] object-contain"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🔹 COLUMNA DERECHA: Acciones del Admin (FIJA EN PC, AL FINAL DEL SCROLL EN MÓVIL) */}
        <div className="w-full md:w-[320px] p-6 flex flex-col gap-3 bg-white dark:bg-neutral-900 md:bg-gray-50/30 md:dark:bg-black/20 shrink-0">
          <h2 className="text-xl font-black dark:text-white mb-2 hidden md:block">Acciones</h2>
          
          <button
            disabled={isLoading || isBanning}
            onClick={() => handleAction("dismissed")}
            className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold transition-all disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-neutral-700"
          >
            <XCircle size={20} />
            <span className="text-sm">Ignorar Falso Reporte</span>
          </button>

          <button
            disabled={isLoading || isBanning}
            onClick={() => handleAction("resolved", "delete")}
            className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl font-bold transition-all disabled:opacity-50 hover:bg-orange-100"
          >
            <Trash2 size={20} />
            <span className="text-sm">Borrar Contenido</span>
          </button>

          <button
            disabled={isLoading || isBanning}
            onClick={handleBan}
            className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl font-bold transition-all disabled:opacity-50 hover:bg-rose-100"
          >
            {isBanning ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Ban size={20} />}
            <span className="text-sm">Banear Autor</span>
          </button>

          <div className="mt-auto pt-4 md:flex justify-end hidden">
            <button onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-bold hover:bg-gray-300 transition-colors">
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportManagementModal;