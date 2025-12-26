import { X} from "lucide-react";
import { useEffect } from "react";

const ImageModal = ({ src, onClose }) => {
  // Bloquear el scroll del cuerpo cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, []);

  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Botón Cerrar */}
      <button 
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-110"
        onClick={onClose}
      >
        <X size={24} />
      </button>

      {/* Imagen Full Screen */}
      <div 
        className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer clic en la imagen
      >
        <img 
          src={src} 
          alt="Full size view" 
          className="rounded-lg shadow-2xl object-contain max-w-full max-h-full"
        />
      </div>
    </div>
  );
};

export default ImageModal;