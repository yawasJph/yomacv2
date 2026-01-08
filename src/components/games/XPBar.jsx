import { motion } from "framer-motion";
//import { useHudStore } from "../../store/useHudStore";

const XPBar = () => {
 // const { xp, xpMax } = useHudStore();
 // const percent = (xp / xpMax) * 100;

  return (
    <div>
      <div className="text-xs text-emerald-200 mb-1">
        XP {"30"}/{"100"}
      </div>

      <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
        <motion.div
          className="h-full bg-linear-to-r from-emerald-400 to-lime-400"
          initial={{ width: 0 }}
          animate={{ width: `${"30%"}%` }}
          transition={{ ease: "easeOut", duration: 0.6 }}
        />
      </div>
    </div>
  );
};

export default XPBar;
