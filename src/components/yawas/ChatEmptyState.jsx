import { Zap } from 'lucide-react'

const ChatEmptyState = (setInput) => {

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 dark:text-gray-400 animate-in fade-in duration-700">
            <div className="max-w-md w-full p-6 md:p-8 text-center">
              <div className="mb-6 p-4 rounded-3xl bg-linear-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900/30 border border-emerald-100 dark:border-emerald-900/30 inline-block">
                <div className="p-4 rounded-2xl bg-linear-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-950/20 shadow-inner">
                  <Zap
                    size={32}
                    className="text-emerald-500 dark:text-emerald-400 mx-auto"
                  />
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent mb-3">
                ¡Hola, estudiante!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-6 leading-relaxed">
                Soy tu asistente académico inteligente. ¿En qué puedo ayudarte
                hoy?
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-sm mx-auto">
                {[
                  "📚 Tareas",
                  "💻 Código",
                  "🤔 Dudas",
                  "🔬 Proyectos",
                  "📝 Ensayos",
                  "🧮 Cálculos",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setInput(item.split(" ")[1]?.toLowerCase() + " ")
                    }
                    className="px-3 py-2.5 text-xs font-medium rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-md hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20 transition-all active:scale-95"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-8 font-medium">
                Pulsa para comenzar
              </p>
            </div>
          </div>
  )
}

export default ChatEmptyState