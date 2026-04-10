import { Info, Github, Globe, Heart, Code, ChevronRight, Rocket } from "lucide-react";

const AboutYoMAC = () => {
  const currentYear = new Date().getFullYear();
  const appVersion = "1.0.0-beta"; // Puedes ir cambiando esto conforme actualices

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      {/* Header Info */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acerca de YoMAC</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Información, versión y créditos de la plataforma.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Tarjeta Principal - Logo y Versión */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center relative overflow-hidden shadow-sm">
          {/* Fondo decorativo opcional */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-linear-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 transform transition hover:scale-105 duration-300">
              {/* <Rocket size={40} className="text-white" /> */}
              <img src="/logo.png" className="object-cover rounded-2xl"/>
            </div>
            <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-400 dark:from-emerald-400 dark:to-teal-300">
              YoMAC
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
              La red social diseñada para conectar, compartir y aprender en comunidad.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-full">
              <Info size={14} />
              Versión {appVersion}
            </div>
          </div>
        </div>

        {/* Tarjeta de Créditos */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-lg">
              <Code size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white">Desarrollo y Diseño</h4>
              <p className="text-sm text-gray-500">El equipo detrás de la magia</p>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 flex-wrap">
              Creado con <Heart size={16} className="text-rose-500 animate-pulse" /> por 
              <span className="font-bold text-gray-900 dark:text-white">Jph</span> 
              para la comunidad.
            </p>
          </div>
        </div>

        {/* Tarjeta de Enlaces Sociales/Código */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          
          {/* Link: Portafolio/Web */}
          <a 
            href="https://llacuash.up.railway.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition border-b border-gray-100 dark:border-gray-800 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-lg">
                <Globe size={18} />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">Visitar Portafolio</span>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
          </a>

          {/* Link: GitHub */}
          {/* <a 
            href="https://github.com/Jph-y" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg">
                <Github size={18} />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">Código Fuente (GitHub)</span>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
          </a> */}

        </div>

        {/* Footer Text */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            © {currentYear} YoMAC. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AboutYoMAC;