import { motion } from "framer-motion";
import { memo } from "react";

const MemoryCard = memo(({ card, isFlipped, isMatched, onClick, isDisabled, cardType }) => {
  return (
    <div
      className={`relative h-25 sm:h-32 w-full ${ //h-28
        isDisabled ? "cursor-default" : "cursor-pointer"
      }`} 
      style={{ perspective: "1000px" }}
      onClick={onClick}
    >
      <motion.div
        animate={{
          rotateY: isFlipped || isMatched ? 180 : 0,
          // Cambiamos la lógica de la escala para que no explote
          scale: isMatched ? 1.05 : 1,
        }}
        transition={{
          // Configuración de giro (Spring para 2 valores)
          rotateY: { type: "spring", stiffness: 260, damping: 20 },
          // Configuración de escala (Tween para evitar el error de keyframes)
          scale: { duration: 0.2 },
        }}
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* LADO TRASERO (Visible al inicio) */}
        <div
          className="absolute inset-0 bg-linear-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg border-2 border-white/20 flex items-center justify-center"
          style={{ backfaceVisibility: "hidden", zIndex: 2 }}
        >
          <div className="size-10 sm:size-15 bg-linear-to-r from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer">
            <img
              src="/logo.png"
              alt="YoMac logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* LADO FRONTAL (Oculto - El Icono/Emoji) */}
        <div
          className={`absolute inset-0 rounded-2xl flex items-center justify-center text-4xl shadow-xl border-2 
            ${
              isMatched
                ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 shadow-indigo-500/20"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            }`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {cardType === "icon" ? (<span className="relative z-10">{card.icon}</span>) : (<img src={card.icon}  className="w-full h-full rounded-2xl object-cover shadow-lg " />)}
          
          {isMatched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-2xl bg-emerald-500/10 animate-pulse"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
});

export default MemoryCard;
