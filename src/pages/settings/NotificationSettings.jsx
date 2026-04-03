import { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Heart,
  MessageSquare,
  AtSign,
  BellRing,
  Reply,
  Repeat2,
} from "lucide-react";
import { toast } from "sonner";

const NotificationSettings = () => {
  // En un proyecto real, estos estados vendrían de tu base de datos (Supabase)
  // o de un Contexto global. Por ahora, simulamos con localStorage.
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("yomac_sound") !== "false",
  );

  // 2. NUEVO: Inicializar las preferencias visuales desde localStorage
  const [preferences, setPreferences] = useState(() => {
    const savedPrefs = localStorage.getItem("yomac_notif_prefs");
    // Si ya existen, las parseamos. Si no, activamos todas por defecto.
    return savedPrefs
      ? JSON.parse(savedPrefs)
      : {
          likes: true,
          comments: true,
          mentions: true,
          replys: true,
          reposts: true,
        };
  });

  // 3. NUEVO: Guardar el objeto preferences en formato JSON cada vez que cambie
  useEffect(() => {
    localStorage.setItem("yomac_notif_prefs", JSON.stringify(preferences));
  }, [preferences]);

  // Efecto para guardar la preferencia de sonido
  useEffect(() => {
    localStorage.setItem("yomac_sound", soundEnabled);
  }, [soundEnabled]);

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);

    // Feedback opcional
    if (newState) {
      toast.success("Sonidos activados", { icon: <Volume2 size={16} /> });
      // Reproducir sonido de prueba bajito
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } else {
      toast("Sonidos silenciados", { icon: <VolumeX size={16} /> });
    }
  };

  const handleTogglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    // Aquí harías un update a Supabase para guardar sus preferencias
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Notificaciones
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Controla cómo y cuándo YoMAC te avisa de las novedades.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-8">
        {/* SECCIÓN 1: Sonidos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="text-emerald-500" size={20} />
            <h3 className="font-bold text-lg dark:text-white">
              Sonidos de la aplicación
            </h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black rounded-xl border border-gray-100 dark:border-gray-800">
            <div>
              <p className="font-medium dark:text-white">Reproducir sonido</p>
              <p className="text-sm text-gray-500">
                Al recibir un nuevo mensaje directo o aviso de Yawas.
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={handleToggleSound}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                soundEnabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        {/* SECCIÓN 2: Alertas Visuales (Campanita) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BellRing className="text-emerald-500" size={20} />
            <h3 className="font-bold text-lg dark:text-white">
              Alertas de interacción
            </h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Elige qué acciones generan una alerta en tu campanita de
            notificaciones.
          </p>

          <div className="space-y-2">
            {/* Opción Likes */}
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-lg">
                  <Heart size={16} />
                </div>
                <span className="font-medium dark:text-gray-200">
                  Me gusta en tus posts o comentarios
                </span>
              </div>
              <button
                onClick={() => handleTogglePreference("likes")}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${preferences.likes ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${preferences.likes ? "translate-x-5" : "translate-x-1"}`}
                />
              </button>
            </div>

            {/* Opción Comentarios */}
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-lg">
                  <MessageSquare size={16} />
                </div>
                <span className="font-medium dark:text-gray-200">
                  Nuevos comentarios en tus posts
                </span>
              </div>
              <button
                onClick={() => handleTogglePreference("comments")}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${preferences.comments ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${preferences.comments ? "translate-x-5" : "translate-x-1"}`}
                />
              </button>
            </div>

            {/* Opción Menciones */}
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/30 text-purple-500 rounded-lg">
                  <AtSign size={16} />
                </div>
                <span className="font-medium dark:text-gray-200">
                  Menciones (@usuario)
                </span>
              </div>
              <button
                onClick={() => handleTogglePreference("mentions")}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${preferences.mentions ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${preferences.mentions ? "translate-x-5" : "translate-x-1"}`}
                />
              </button>
            </div>

            {/* Opción Replys */}
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/30 text-orange-500 rounded-lg">
                  <Reply size={16} />
                </div>
                <span className="font-medium dark:text-gray-200">Replys</span>
              </div>
              <button
                onClick={() => handleTogglePreference("replys")}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${preferences.replys ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${preferences.replys ? "translate-x-5" : "translate-x-1"}`}
                />
              </button>
            </div>

            {/* Opción Repost */}
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-500 rounded-lg">
                  <Repeat2 size={16} />
                </div>
                <span className="font-medium dark:text-gray-200">Repost</span>
              </div>
              <button
                onClick={() => handleTogglePreference("reposts")}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${preferences.reposts ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${preferences.reposts ? "translate-x-5" : "translate-x-1"}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
