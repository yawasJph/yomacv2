
import { NavLink } from "react-router-dom";

const UserCreditsWidgets = () => {
  return (
    <div>
      <div className="bg-gray-50 dark:bg-neutral-900 p-5 rounded-4xl border border-gray-100 dark:border-neutral-800">
        <p className="text-xs font-bold text-gray-500 uppercase">
          Tu Billetera
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-2xl font-black dark:text-white">
            1,250 <span className="text-emerald-500 text-sm">CC</span>
          </span>
          <NavLink
            to="games/store"
            className="text-xs font-bold text-emerald-500 hover:underline"
          >
            Ver tienda
          </NavLink>
        </div>
      </div>
      <div className="bg-linear-to-br from-emerald-500 to-teal-600 p-6 rounded-[2.5rem] text-white shadow-lg shadow-emerald-500/20">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
          Mi Saldo Campus
        </p>
        <div className="flex items-end gap-2 mt-1">
          <h3 className="text-3xl font-black">{0}</h3>
          <span className="text-sm font-bold mb-1">CC</span>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
          <span className="text-xs font-medium">Rango: Novato</span>
          <div className="h-1.5 w-24 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white w-1/3 shadow-[0_0_10px_white]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCreditsWidgets;
