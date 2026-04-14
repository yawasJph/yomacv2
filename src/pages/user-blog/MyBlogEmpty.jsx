import { FileText } from "lucide-react";
import React from "react";

export const MyBlogEmpty = () => {
  return (
    <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
      <FileText className="mx-auto mb-4 text-zinc-400" size={48} />
      <p className="text-zinc-500">Aún no has escrito nada. ¡Empieza hoy!</p>
    </div>
  );
};
