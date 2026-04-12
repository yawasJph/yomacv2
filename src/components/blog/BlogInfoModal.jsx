import { Info, X } from "lucide-react";
import { memo } from "react";

const InfoModal = memo(({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Modal */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-[90%] max-w-sm shadow-xl text-center relative animate-in fade-in zoom-in">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {/* Icono */}
        <div className="flex justify-center mb-4">
          <Info className="text-indigo-600" size={32} />
        </div>

        {/* Texto */}
        <h2 className="text-lg font-bold mb-2 dark:text-white">Función no disponible</h2>

        <p className="text-gray-600 text-sm dark:text-gray-400">
          La creación de blogs solo está disponible en modo escritorio 💻. Por
          favor accede desde una computadora para crear contenido.
        </p>

        {/* Botón */}
        <button
          onClick={onClose}
          className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-semibold"
        >
          Entendido
        </button>
      </div>
    </div>
  );
});

export default InfoModal;
