import { motion } from "framer-motion";

const MemoryCard = ({ card, isFlipped, isMatched, onClick, isDisabled }) => {


  return (
    <div 
      className={`relative h-28 sm:h-32 w-full perspective-1000 ${isDisabled ? 'cursor-default' : 'cursor-pointer'}`}
      onClick={onClick}
    >
      <motion.div
        animate={{ 
          rotateY: isFlipped || isMatched ? 180 : 0,
          scale: isMatched ? [1, 1.1, 1] : 1, // Pequeño brinco al acertar
        }}
        transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
        className="w-full h-full relative preserve-3d"
      >
        {/* LADO FRONTAL (Oculto - El dibujo) */}
        <div 
          className={`absolute inset-0 rounded-2xl flex items-center justify-center text-3xl shadow-xl backface-hidden rotate-y-180 border-2 
            ${isMatched 
              ? "bg-emerald-500/20 border-emerald-500 shadow-emerald-500/20" 
              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            }`}
        >
          {card.type}
          {isMatched && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-2xl bg-emerald-500/10 animate-pulse"
            />
          )}
        </div>

        {/* LADO TRASERO (Visible - El logo de la app) */}
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg backface-hidden border-2 border-white/20 flex items-center justify-center">
           <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <img src="/yc.jpg" className="h-15 w-15 rounded-full shadow-lg"></img>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MemoryCard