import { motion } from "framer-motion";

const ComingSoonWordleCard = () => {
  const letters = ["P", "A", "L", "A", "B", "R", "A"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative group p-6 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800/50 
      bg-linear-to-br from-emerald-400/20 via-yellow-300/10 to-gray-300/20 
      dark:from-emerald-900/30 dark:via-yellow-800/20 dark:to-gray-800/40
      hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500"
    >
      {/* Badge */}
      <div
        className="absolute top-4 right-4 px-3 py-1 text-[10px] font-black tracking-widest rounded-xl 
      bg-yellow-400 text-black shadow-md"
      >
        MUY PRONTO
      </div>

      {/* Icono */}
      <div className="mb-6">
        <div className="p-4 bg-white dark:bg-gray-950 rounded-2xl shadow-xl w-fit group-hover:scale-110 transition">
          🧠
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-black mb-2 dark:text-white">
        Palabra Diaria
      </h3>

      {/* Description */}
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
        Descubre la palabra oculta del día. Cada intento te acerca más… o no 😏
      </p>

      {/* Tiles estilo Wordle */}
      <div className="flex gap-2 mb-5">
        {letters.map((l, i) => {
          const colors = [
            "bg-green-500 text-white",
            "bg-yellow-400 text-black",
            "bg-gray-400 text-white",
          ];
          const randomColor = colors[i % colors.length];

          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.15, rotate: 2 }}
              className={`w-9 h-9 flex items-center justify-center rounded-md font-black text-sm shadow-md ${randomColor}`}
            >
              {l}
            </motion.div>
          );
        })}
      </div>

      {/* Fake CTA */}
      <div className="text-xs font-black uppercase tracking-wider text-gray-400">
        Disponible próximamente
      </div>

      {/* Fondo decorativo tipo GameCard */}
      <div className="absolute -right-10 -bottom-10 opacity-[0.05] group-hover:rotate-12 group-hover:scale-125 transition-all duration-700">
        <span className="text-[120px]">🧠</span>
      </div>
    </motion.div>
  );
};

export default ComingSoonWordleCard;
