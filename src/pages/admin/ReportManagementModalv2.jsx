import { useBanUser } from "@/hooks/admin/useBanUserv2";
import { useResolveReport } from "@/hooks/admin/useResolveReport";
import { XCircle, Trash2, Ban, Image as ImageIcon } from "lucide-react";
import { optimizeMedia } from "@/cloudinary/optimizeMedia";
import { createPortal } from "react-dom";

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

  console.log(report)

  return createPortal(
    <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal más ancho: max-w-3xl */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 animate-in zoom-in-95 duration-200">
        
        {/* COLUMNA IZQUIERDA: Contexto del Reporte */}
        <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-100 dark:border-neutral-800 pr-0 md:pr-6 pb-6 md:pb-0">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black rounded-full uppercase">
              {report.reason}
            </span>
          </div>

          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Detalles del reportador:</h3>
          <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-2xl mb-6">
            <div className="flex items-center gap-2 mb-2">
              <img src={optimizeMedia(report.reporter.avatar, "image") || "/default.jpg"} className="w-6 h-6 rounded-full" />
              <span className="text-sm font-bold dark:text-white">{report.reporter.full_name}</span>
            </div>
            {/* Mostrar los details escritos por el usuario */}
            {report.details ? (
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{report.details}"</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Sin detalles adicionales.</p>
            )}
          </div>

          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Contenido a evaluar:</h3>
          <div className="border border-gray-200 dark:border-neutral-700 rounded-2xl p-4">
             <div className="flex items-center gap-2 mb-3">
              <img src={optimizeMedia(report.post?.author?.avatar || report.comment?.author?.avatar, "image") || "/default.jpg"} className="w-8 h-8 rounded-full" />
              <div>
                <span className="text-sm font-bold dark:text-white block leading-tight">
                  {report.post?.author?.full_name || report.comment?.author?.full_name}
                </span>
                <span className="text-[10px] text-gray-400">Autor Reportado</span>
              </div>
            </div>

            {/* Texto del post/comentario */}
            <p className="text-base dark:text-white mb-3">
              {report.post?.content || report.comment?.content || <span className="text-gray-400 italic">Sin texto.</span>}
            </p>

            {/* Renderizar Imágenes si existen */}
            {mediaItems.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {mediaItems.map((media, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-black">
                    {media.media_type === "image" ? (
                      <img src={optimizeMedia(media.media_url, media.media_type)} className="object-cover w-full h-full opacity-90 hover:opacity-100 transition" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-white"><ImageIcon /> Video</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Acciones del Admin */}
        <div className="w-full md:w-64 flex flex-col gap-3">
          <h2 className="text-xl font-black dark:text-white mb-2">Acciones</h2>
          
          <button
            disabled={isLoading || isBanning}
            onClick={() => handleAction("dismissed")}
            className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-neutral-800 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-2xl font-bold transition-all disabled:opacity-50"
          >
            <XCircle size={20} />
            <span className="text-sm">Ignorar Falso Reporte</span>
          </button>

          <button
            disabled={isLoading || isBanning}
            onClick={() => handleAction("resolved", "delete")}
            className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl font-bold transition-all disabled:opacity-50"
          >
            <Trash2 size={20} />
            <span className="text-sm">Borrar Contenido</span>
          </button>

          <button
            disabled={isLoading || isBanning}
            onClick={handleBan}
            className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl font-bold transition-all disabled:opacity-50"
          >
            {isBanning ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Ban size={20} />}
            <span className="text-sm">Banear Autor</span>
          </button>

          <div className="mt-auto pt-4 flex justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-white rounded-full text-sm font-bold">
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>, document.body
  );
};

export default ReportManagementModal;