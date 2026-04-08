import { motion, AnimatePresence } from "framer-motion";
import CazaTalentosResults from "@/components/games/caza-talento/CazaTalentosResults";
import { useIsMobile } from "../../../hooks/useIsMobile";


 export const ResultsSheet = ({ onClose, ...props }) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <CazaTalentosResults {...props} />;
  }

  return (
    <AnimatePresence>
      <>
        {/* BACKDROP */}
        <motion.div
          className="fixed inset-0 bg-black/40 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* SHEET */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="
              fixed bottom-0 left-0 right-0 z-50
              rounded-t-4xl
              bg-white dark:bg-neutral-950
              max-h-[90vh] overflow-y-auto
              p-4
            "
        >
          {/* HANDLE */}
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-neutral-700 rounded-full mx-auto mb-4" />

          <CazaTalentosResults {...props} />
        </motion.div>
      </>
    </AnimatePresence>
  );
};
