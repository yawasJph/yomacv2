import { Send } from "lucide-react";
import React from "react";

const PublicButton = ({loading, isMobile , onPublic }) => {
  return (
    <button
      onClick={onPublic}
      disabled={loading}
      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
    >
       {loading ? (
         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ):(
        isMobile ? <Send size={18}/>: "Publicar" 
      )}
    </button>
  );
};

export default PublicButton;
