// Modal mejorado con botón de acción directa
import {  motion } from "framer-motion";
import { getDiffColor } from "../utils/getDiffColor";

const GameInfoModal = ({ game, onClose, onPlay }) => (
    <motion.div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-white/5"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-5 rounded-3xl bg-gray-50 dark:bg-white/5 mb-4 shadow-inner">
            {game.icon}
          </div>
          <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter">{game.title}</h2>
          <span className={`mt-2 text-[10px] font-bold px-3 py-1 rounded-full border ${getDiffColor(game.difficulty)}`}>
            Dificultad {game.difficulty}
          </span>
        </div>
  
        <div className="space-y-4 mb-8">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Reglas del juego</h4>
          <ul className="space-y-3">
            {game.howToPlay?.map((step, i) => (
              <li key={i} className="flex gap-4 text-sm text-gray-600 dark:text-gray-300 font-medium leading-snug">
                <div className="shrink-0 w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                  {i + 1}
                </div>
                {step}
              </li>
            ))}
          </ul>
        </div>
  
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            Cerrar
          </button>
          <button onClick={onPlay} className="py-4 rounded-2xl font-black bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all">
            ¡Jugar ahora!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  export default GameInfoModal