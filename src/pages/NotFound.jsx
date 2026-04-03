import { useNavigate } from "react-router-dom";
import { MoveLeft, ShieldQuestion } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 relative py-12 px-6 sm:px-8 lg:px-12 flex flex-col items-center justify-center">
      
      {/* Botón volver – esquina superior izquierda */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-900 shadow-sm hover:scale-105 active:scale-95 transition dark:text-white"
          title="Volver al Feed"
        >
          <MoveLeft size={20} />
        </button>
      </div>

      <div className="max-w-xl mx-auto text-center space-y-12">
        
        {/* Sección de la ilustración 404 */}
        <div className="relative">
          <h1 className="text-[10rem] sm:text-[14rem] lg:text-[18rem] font-bold leading-none bg-linear-to-b from-emerald-500 to-emerald-200 dark:from-emerald-400 dark:to-black bg-clip-text text-transparent opacity-30 dark:opacity-50">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-5 rounded-3xl bg-emerald-50/10 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/10">
              <ShieldQuestion size={80} className="text-emerald-600 dark:text-emerald-400" strokeWidth={1.5}/>
            </div>
          </div>
        </div>

        {/* Sección de texto y descripción */}
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            ¡Página no encontrada!
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg mx-auto">
            Vaya, parece que te has aventurado en un rincón desconocido de YoMAC. El enlace podría estar roto o la página que buscas ya no existe.
          </p>
        </div>

        {/* Sección del botón para volver */}
        <div className="pt-6">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-3 px-8 py-4 bg-linear-to-r from-emerald-500 to-teal-400 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-300 font-bold text-lg w-full sm:w-auto mx-auto"
          >
            <MoveLeft size={22} className="group-hover:-translate-x-1 transition-transform"/>
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;