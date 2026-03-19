import { AlertCircle, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useReportsStats } from "@/hooks/admin/useReportsStats";

const ReportStatCard = () => {
  const { data, isLoading } = useReportsStats();

  if (isLoading) {
    return (
      <div className="skeleton h-32 bg-gray-100 dark:bg-neutral-800 animate-pulse rounded-3xl" />
    );
  }

  const hasUrgentReports = data.pending > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden bg-white dark:bg-neutral-900 p-4 rounded-3xl border ${
        hasUrgentReports
          ? "border-rose-200 dark:border-rose-500/30"
          : "border-gray-100 dark:border-neutral-800"
      } shadow-sm`}
    >
      {/* Glow decorativo de fondo si hay pendientes */}
      {hasUrgentReports && (
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/10 blur-2xl rounded-full" />
      )}

      <div className="flex justify-between items-start mb-2">
        <div
          className={`p-2 rounded-xl ${
            hasUrgentReports
              ? "bg-rose-50 dark:bg-rose-500/10 text-rose-500"
              : "bg-gray-50 dark:bg-neutral-800 text-gray-400"
          }`}
        >
          <AlertCircle size={20} />
        </div>

        {data.recent24h > 0 && (
          <div className="flex items-center gap-0.5 text-rose-500 font-bold text-[10px] bg-rose-50 dark:bg-rose-500/5 px-2 py-0.5 rounded-full">
            <ArrowUpRight size={10} />
            {data.recent24h} nuevos
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <p
            className={`text-2xl font-black tracking-tight ${
              hasUrgentReports
                ? "text-rose-600 dark:text-rose-400"
                : "dark:text-white"
            }`}
          >
            {data.pending}
          </p>
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            Pendientes
          </span>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
          Moderación
        </p>
      </div>

      {/* Barra indicadora visual */}
      {hasUrgentReports && (
        <div className="mt-3 h-1 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
            className="h-full bg-rose-500"
          />
        </div>
      )}
    </motion.div>
  );
};

export default ReportStatCard;
