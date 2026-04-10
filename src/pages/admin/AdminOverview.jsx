import { ArrowLeft, Users, Bug, BrushCleaning } from "lucide-react";
import UserStatCard from "./UserStatCard";
import ReportStatCard from "./ReportStatCard";
import ReportList from "./ReportListv2";
import ReportManagementModal from "./ReportManagementModalv4";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminOverview = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-6">
      {/* 1. Header de Bienvenida */}
      <div className="sticky top-[57px] z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-2 flex items-center gap-6 border-b border-transparent">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-black dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Estado general de la plataforma
          </p>
        </div>
      </div>

      {/* 2. Grid de Estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        <ReportStatCard />
        <UserStatCard />
      </div>

      {/* 3. Acciones Rápidas (Mobile UI) */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Acciones Rápidas
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <Link to={"/admin/dashboard/users"}>
            <QuickActionButton icon={<Users />} label="Usuarios" />
          </Link>

          <Link to={"/admin/dashboard/bugs"}>
            <QuickActionButton icon={<Bug />} label="Bugs/FeedBack" />
          </Link>

          <Link to={"/admin/dashboard/cleanup"}>
            <QuickActionButton icon={<BrushCleaning />} label="Limpiar" />
          </Link>

        </div>
      </section>

      {/* 4. Actividad Reciente o Reportes Urgentes */}
      <section className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-gray-100 dark:border-neutral-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black dark:text-white">Reportes Urgentes</h3>
          <button className="text-xs text-emerald-500 font-bold">
            Ver todos
          </button>
        </div>

        {/* Lista simple de reportes */}
        <ReportList onSelect={setSelectedReport} />
      </section>

      {selectedReport && (
        <ReportManagementModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};

export default AdminOverview;

const QuickActionButton = ({ icon, label }) => (
  <button className="flex flex-col items-center gap-2 min-w-20">
    <div className="w-14 h-14 bg-white dark:bg-neutral-900 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-neutral-800 dark:text-white">
      {icon}
    </div>
    <span className="text-[10px] font-bold text-gray-500 uppercase">
      {label}
    </span>
  </button>
);
