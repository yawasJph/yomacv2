import { optimizeMedia } from "@/cloudinary/optimizeMedia";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { useToggleBan } from "@/hooks/admin/useToggleBan";
import { Search, UserX, UserCheck, ShieldAlert, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminUsersManager = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // 'all' | 'banned'
  const { data: users, isLoading } = useAdminUsers(search, filter);
  const { mutate: toggleBan } = useToggleBan(); // Implementaremos esta abajo
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
      {/* Header & Search - Sticky */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md p-4 border-b border-gray-100 dark:border-neutral-800">
        <div className="p-2 flex items-center gap-6 border-b border-transparent">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="dark:text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-black dark:text-white">
              Usuarios
            </h1>
          </div>
        </div>
        <div className="relative mb-4">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-neutral-900 rounded-2xl text-sm focus:ring-2 ring-emerald-500 outline-none dark:text-white"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabs de Filtro */}
        <div className="flex gap-2">
          <FilterTab
            active={filter === "all"}
            label="Todos"
            onClick={() => setFilter("all")}
          />
          <FilterTab
            active={filter === "banned"}
            label="Baneados"
            onClick={() => setFilter("banned")}
            color="rose"
          />
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {isLoading ? (
          <p className="text-center text-gray-500 text-sm">
            Cargando usuarios...
          </p>
        ) : (
          users?.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-gray-100 dark:border-neutral-800 flex items-center gap-4"
            >
              <img
                src={optimizeMedia(user.avatar, "image") || "/default.jpg"}
                className="w-12 h-12 rounded-2xl object-cover"
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm dark:text-white truncate">
                  {user.full_name}
                </h4>
                <p className="text-[10px] text-gray-500 truncate">
                  {user.email}
                </p>
                {user.is_banned && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase mt-1">
                    <ShieldAlert size={10} /> Suspendido
                  </span>
                )}
              </div>

              {/* Botón de Acción rápida estilo Supabase */}
              <button
                onClick={() => {
                  if (
                    confirm(
                      `¿Seguro que quieres ${user.is_banned ? "activar" : "suspender"} a este usuario?`,
                    )
                  ) {
                    toggleBan({
                      userId: user.id,
                      currentStatus: user.is_banned,
                    });
                  }
                }}
                className={`p-3 rounded-2xl transition-colors ${
                  user.is_banned
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                    : "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                }`}
              >
                {user.is_banned ? <UserCheck size={20} /> : <UserX size={20} />}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUsersManager;

const FilterTab = ({ active, label, onClick, color = "emerald" }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
      active
        ? `bg-${color}-500 text-white shadow-lg shadow-${color}-500/20`
        : "bg-gray-100 dark:bg-neutral-900 text-gray-500"
    }`}
  >
    {label}
  </button>
);
