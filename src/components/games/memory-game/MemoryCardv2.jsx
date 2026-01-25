import { motion } from "framer-motion";
import { memo } from "react";

// 1. Diccionario de Estilos (Mantenlo fuera para que no se recree en cada render)
const CARD_STYLES = {
  // Lado de atrás (cuando la carta está tapada)
  back: "absolute inset-0 bg-linear-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg border-2 border-white/20 flex items-center justify-center",
  logoContainer: "size-10 sm:size-15 grand-emerald rounded-xl flex items-center justify-center overflow-hidden cursor-pointer",
  
  // Lado de frente (cuando se voltea)
  frontBase: "absolute inset-0 rounded-2xl flex items-center justify-center text-4xl shadow-xl border-2 transition-colors duration-300",
  frontMatched: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 shadow-indigo-500/20",
  frontDefault: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
};

const MemoryCard = memo(({ card, isFlipped, isMatched, onClick, isDisabled, cardType }) => {
  
  // 2. Lógica de estilos derivada (Calculada antes del return)
  const frontStyles = `${CARD_STYLES.frontBase} ${isMatched ? CARD_STYLES.frontMatched : CARD_STYLES.frontDefault}`;

  return (
    <div
      className={`relative h-25 sm:h-32 w-full ${isDisabled ? "cursor-default" : "cursor-pointer"}`} 
      style={{ perspective: "1000px" }}
      onClick={onClick}
    >
      <motion.div
        animate={{
          rotateY: isFlipped || isMatched ? 180 : 0,
          scale: isMatched ? 1.05 : 1,
        }}
        transition={{
          rotateY: { type: "spring", stiffness: 260, damping: 20 },
          scale: { duration: 0.2 },
        }}
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* LADO TRASERO (Logo) */}
        <div 
          className={CARD_STYLES.back}
          style={{ backfaceVisibility: "hidden", zIndex: 2 }}
        >
          <div className={CARD_STYLES.logoContainer}>
            <img src="/logo.png" alt="logo" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* LADO FRONTAL (Contenido) */}
        <div
          className={frontStyles}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {cardType === "icon" ? (
            <span className="relative z-10">{card.icon}</span>
          ) : (
            <img src={card.icon} className="w-full h-full rounded-2xl object-cover shadow-lg" />
          )}
          
          {isMatched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-2xl bg-indigo-500/10 animate-pulse"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
});

export default MemoryCard;