import { Save } from "lucide-react";
import React from "react";

const SaveButton = ({loading, isMobile , onSave }) => {
  return (
    <button
      onClick={onSave}
      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
    >
      {loading ? (
         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ):(
        isMobile ? <Save size={18}/>: "Guardar" 
      )}
    </button>
  );
};

export default SaveButton;
