import { Ban, BellRing, ShieldCheck, Trash2, UserMinus } from "lucide-react";

const AdminUserActions = ({ user, onAction }) => {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-t-3xl p-6 shadow-2xl border-t border-gray-100 dark:border-neutral-800">
      {/* Mini Info del Usuario */}
      <div className="flex items-center gap-4 mb-8">
        <img 
          src={user.avatar || "/default.jpg"} 
          className="w-14 h-14 rounded-2xl object-cover" 
        />
        <div>
          <h3 className="font-black text-lg dark:text-white">{user.full_name}</h3>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Rejilla de Acciones Rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <ActionButton 
          icon={<Ban size={20} />} 
          label="Banear" 
          color="rose" 
          onClick={() => onAction('ban', user.id)} 
        />
        <ActionButton 
          icon={<UserMinus size={20} />} 
          label="Mute 24h" 
          color="amber" 
          onClick={() => onAction('mute', user.id)} 
        />
        <ActionButton 
          icon={<ShieldCheck size={20} />} 
          label="Verificar" 
          color="emerald" 
          onClick={() => onAction('verify', user.id)} 
        />
        <ActionButton 
          icon={<BellRing size={20} />} 
          label="Advertir" 
          color="blue" 
          onClick={() => onAction('warn', user.id)} 
        />
      </div>

      {/* Botón de Peligro: Borrar cuenta */}
      <button className="w-full mt-6 p-4 flex items-center justify-center gap-2 text-rose-500 font-bold bg-rose-50 dark:bg-rose-500/10 rounded-2xl transition-colors">
        <Trash2 size={18} />
        Eliminar Permanentemente
      </button>
    </div>
  );
};

// Sub-componente para los botones
const ActionButton = ({ icon, label, color, onClick }) => {
  const colors = {
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  };

  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-3xl gap-2 transition-transform active:scale-95 ${colors[color]}`}
    >
      {icon}
      <span className="text-[11px] font-black uppercase tracking-wider">{label}</span>
    </button>
  );
};

export default AdminUserActions