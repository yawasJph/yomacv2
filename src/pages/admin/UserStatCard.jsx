import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { useAdminStats } from "@/hooks/admin/useAdminStats";

const UserStatCard = () => {

const { data, isLoading } = useAdminStats();


  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-gray-100 dark:border-neutral-800 animate-pulse">
        <div className="skeleton w-10 h-10 bg-gray-200 dark:bg-neutral-800 rounded-xl mb-4" />
        <div className="skeleton h-8 w-16 bg-gray-200 dark:bg-neutral-800 rounded-lg mb-2" />
        <div className="skeleton h-3 w-24 bg-gray-100 dark:bg-neutral-800 rounded-md" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
          <Users size={20} />
        </div>
        {data.newToday > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
            +{data.newToday} hoy
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl font-black dark:text-white tracking-tight">
          {new Intl.NumberFormat().format(data.total)}
        </p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Usuarios Totales
        </p>
      </div>

      <div className="mt-3 flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-[9px] font-medium text-gray-500">Actualizado hace un momento</p>
      </div>
    </motion.div>
  );
};

export default UserStatCard