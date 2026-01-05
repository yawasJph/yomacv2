import React, { useEffect, useState } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";

const BadgeStore = ({ userCredits }) => {
  const [badges, setBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    const { data: b } = await supabaseClient.from("badges").select("*");
    const { data: ub } = await supabaseClient.from("user_badges").select("badge_id").eq("user_id", (await supabaseClient.auth.getUser()).data.user.id);
    setBadges(b);
    setMyBadges(ub.map(x => x.badge_id));
  };

  const handleBuy = async (badgeId) => {
    const { data, error } = await supabaseClient.rpc('buy_badge', { p_badge_id: badgeId });
    if (error) toast.error(error.message);
    else {
      toast.success("¡Insignia comprada!");
      fetchStoreData();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6 text-2xl font-black dark:text-white">
        <ShoppingBag className="text-emerald-500" />
        <h2>Campus Store</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {badges.map((badge) => {
          const owned = myBadges.includes(badge.id);
          return (
            <div key={badge.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-3xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="text-4xl bg-gray-50 dark:bg-gray-800 w-16 h-16 flex items-center justify-center rounded-2xl">
                  {badge.icon}
                </div>
                <div>
                  <h3 className="font-bold dark:text-white">{badge.name}</h3>
                  <p className="text-emerald-500 font-black text-sm">{badge.price} CC</p>
                </div>
              </div>

              <button
                disabled={owned || userCredits < badge.price}
                onClick={() => handleBuy(badge.id)}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  owned 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95"
                }`}
              >
                {owned ? <Check size={18} className="mx-auto" /> : "Comprar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeStore;