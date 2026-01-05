import React, { useEffect, useState } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { Coins } from "lucide-react";

const UserCredits = ({ userId }) => {
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // 1. Carga inicial de créditos
    const getInitialCredits = async () => {
      const { data } = await supabaseClient
        .from("profiles")
        .select("credits")
        .eq("id", userId)
        .single();
      if (data) setCredits(data.credits);
      
    };

    getInitialCredits();

    console.log(credits)

    // 2. Escuchar cambios en TIEMPO REAL
    const channel = supabaseClient
      .channel(`profile_changes_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          // Si los créditos cambiaron, actualizamos el estado
          if (payload.new.credits !== undefined) {
            setCredits(payload.new.credits);
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-500/20 shadow-sm transition-all hover:scale-105">
      <div className="bg-amber-400 p-1 rounded-full">
        <Coins size={14} className="text-white" />
      </div>
      <span className="font-black text-amber-600 dark:text-amber-400 tabular-nums">
        {credits.toLocaleString()}
      </span>
      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">
        CC
      </span>
    </div>
  );
};

export default UserCredits;