import { motion, AnimatePresence } from "framer-motion";
import { Gem, Star } from "lucide-react";
import XPBar from "./XPBar";
//import { useHudStore } from "../../store/useHudStore";


const RpgHud = ({visible = false, credits= 100 , level=3}) => {
  //const { visible, credits, level } = useHudStore();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="
            fixed top-20 right-6 z-999
            w-56 rounded-2xl
            bg-linear-to-br from-black/90 to-emerald-900/80
            border border-emerald-500/30
            shadow-[0_0_40px_rgba(16,185,129,0.35)]
            backdrop-blur-xl
            p-4
          "
        >
          {/* Level */}
          <div className="flex items-center gap-2 mb-2">
            <Star className="text-yellow-400" size={18} />
            <span className="text-white font-semibold">
              Lv. {level}
            </span>
          </div>

          {/* Credits */}
          <div className="flex items-center gap-2 text-emerald-300 mb-3">
            <Gem size={18} />
            <span className="font-mono font-bold">
              {credits.toLocaleString()}
            </span>
          </div>

          {/* XP */}
          <XPBar/>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RpgHud;
