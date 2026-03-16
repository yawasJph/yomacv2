import { Search, Users, X } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HelperModal = ({ onClose }) => {

  const navigate = useNavigate()

  useEffect(() => {
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Overlay oscuro */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Contenedor Adaptativo */}
      <div
        className={`
             bg-white dark:bg-zinc-900 w-full 
            fixed bottom-0 rounded-t-4xl p-8 pb-12 animate-in slide-in-from-bottom duration-300
            md:relative md:bottom-auto md:max-w-sm md:rounded-3xl md:p-10 md:animate-in md:zoom-in-95
          `}
      >
        {/* Tirador para móvil */}
        <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6 md:hidden" />

        {/* Botón cerrar para Desktop */}
        <button
          onClick={onClose}
          className="hidden md:block absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-500/10 rounded-2xl mb-6">
            <Users className="text-indigo-600 dark:text-indigo-400" size={32} />
          </div>

          <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-3">
            Amigos Mutuos
          </h2>

          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[15px] px-2">
            Para proteger tu privacidad, en{" "}
            <span className="text-indigo-600 font-bold">YoMAC</span> solo pueden
            chatear las personas que{" "}
            <span className="font-bold underline decoration-indigo-500">
              se siguen mutuamente
            </span>
            .
          </p>

          <div className="mt-8 space-y-3">
            {/* BOTÓN PRIMARIO: IR A BUSCAR AMIGOS */}
            <button
              onClick={() => {
                onClose();
                navigate("/users");
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.97] shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Explorar personas
            </button>

            {/* BOTÓN SECUNDARIO: CERRAR */}
            <button
              onClick={onClose}
              className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 font-bold py-4 rounded-2xl transition-all active:scale-[0.97]"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperModal;
