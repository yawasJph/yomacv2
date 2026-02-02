import React, { useEffect, useState } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import {
  ShoppingBag,
  Check,
  Sparkles,
  Image as ImageIcon,
  Gift,
  Wallet,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../hooks/useProfile";
import { useNavigate } from "react-router-dom";

const YoMACStore = () => {
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [activeTab, setActiveTab] = useState("badge"); // 'badge', 'sticker', 'gif'
  const [loading, setLoading] = useState(true);
  const [userCredits, setUserCredits] = useState(0);
  const [filter, setFilter] = useState("all"); // 'all', 'carrera', 'affordable'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'price-low', 'price-high'
  const { user: currentUser } = useAuth();
  const { data: userProfile } = useProfile(currentUser?.id);
  const navigate = useNavigate()

  const categories = [
    { id: "badge", label: "Insignias", icon: <Sparkles size={18} /> },
    { id: "sticker", label: "Stickers", icon: <ImageIcon size={18} /> },
    { id: "gif", label: "Gifs Animados", icon: <Gift size={18} /> },
  ];

  useEffect(() => {
    fetchStoreData();
    fetchUserCredits();
  }, []);

  const fetchStoreData = async () => {
    if (currentUser) {
      setLoading(true);
      const { data: b } = await supabaseClient.from("badges").select("*");
      // const {
      //   data: { user },
      // } = await supabaseClient.auth.getUser();
      const { data: ub } = await supabaseClient
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", currentUser?.id);

      setItems(b || []);
      setMyItems(ub?.map((x) => x.badge_id) || []);
      setLoading(false);
    } else {
      setLoading(true);
      const { data: b } = await supabaseClient.from("badges").select("*");
      setItems(b || []);
      setMyItems([]);
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    if (!currentUser) return;
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("credits")
      .eq("id", currentUser?.id)
      .single();
    if (data) setUserCredits(data.credits);
  };

  const handleBuy = async (itemId) => {
    // Reutilizamos tu función RPC (funciona igual para stickers si están en la tabla badges)
    const { error } = await supabaseClient.rpc("buy_badge", {
      p_badge_id: itemId,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("¡Adquisición completada!");
      fetchStoreData();
    }
  };
  // Lógica de filtrado combinada
  const filteredItems = items
    .filter((item) => {
      // 1. Filtro por Categoría (Tabs)
      if (item.category !== activeTab) return false;

      // 2. Filtro de búsqueda/exclusividad
      if (filter === "carrera")
        return item.carrera_restriccion === userProfile?.carrera;
      if (filter === "affordable")
        return item.price <= userCredits && !myItems.includes(item.id);

      return true;
    })
    .sort((a, b) => {
      // 3. Lógica de Ordenamiento
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return new Date(b.created_at) - new Date(a.created_at); // newest
    });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ">
        <div >
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors flex"
          >
            <ArrowLeft size={20} className="dark:text-white" />
          </button>
          <h2 className="text-3xl font-black dark:text-white flex items-center gap-2">
            <ShoppingBag className="text-emerald-500" strokeWidth={3} />
            YoMAC Store
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Personaliza tu presencia en la comunidad
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-3">
          <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 leading-none">
              Tu Saldo
            </p>
            <p className="text-lg font-black dark:text-white">
              {userCredits.toLocaleString()}{" "}
              <span className="text-xs font-medium text-gray-500">CC</span>
            </p>
          </div>
        </div>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl w-fit">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === cat.id
                ? "bg-white dark:bg-gray-800 text-emerald-500 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {/* Filtro de Exclusividad */}
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === "all"
                ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("carrera")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === "carrera"
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            }`}
          >
            ✨ Para mi carrera
          </button>
          <button
            onClick={() => setFilter("affordable")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === "affordable"
                ? "bg-amber-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            }`}
          >
            💸 Me alcanza
          </button>
        </div>

        {/* Selector de Orden */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-transparent text-sm font-bold text-gray-500 dark:bg-gray-800 outline-none cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <option value="newest">Recientes</option>
          <option value="price-low">Precio: Menor a Mayor</option>
          <option value="price-high">Precio: Mayor a Menor</option>
        </select>
      </div>

      {/* GRID DE PRODUCTOS */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isOwned = myItems?.includes(item.id);
            const canAfford = userCredits >= item.price;
            // Nueva validación: ¿El ítem es para otra carrera?
            const isWrongCarrera =
              item.carrera_restriccion &&
              item.carrera_restriccion !== userProfile?.carrera;

            return (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-[2.5rem] flex flex-col items-center text-center transition-all hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1"
              >
                {item.carrera_restriccion && (
                  <div className="absolute -top-1 -right-1 z-20">
                    <div className="relative group/badge">
                      {/* Resplandor de fondo animado */}
                      <div className="absolute -inset-0.5 bg-linear-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-30 group-hover/badge:opacity-100 transition duration-1000 group-hover/badge:duration-200 animate-tilt"></div>

                      {/* Cuerpo del Badge */}
                      <span className="relative flex items-center gap-1 bg-white/80 dark:bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-xl">
                        {/* Puntito brillante indicativo */}
                        {/* <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span> */}

                        <span className="text-[10px] font-black uppercase tracking-tighter bg-linear-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                          {item.carrera_restriccion}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
                {/* Visual del Item */}
                <div className="mb-4 relative">
                  <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                  {item.category === "badge" ? (
                    <span className="text-5xl block relative drop-shadow-sm group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                  ) : (
                    <img
                      src={item.resource_url}
                      alt={item.name}
                      className="w-24 h-24 object-contain relative z-10 group-hover:scale-110 transition-transform pointer-events-none"
                    />
                  )}
                </div>

                {/* Información */}
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">
                  {item.name}
                </h3>
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="text-emerald-500 font-black text-base">
                    {item.price}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Credits
                  </span>
                </div>

                {/* Botón de Acción */}
                <button
                  disabled={isOwned || !canAfford || isWrongCarrera}
                  onClick={() => handleBuy(item.id)}
                  className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    isWrongCarrera
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : isOwned
                        ? "bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-default"
                        : canAfford
                          ? "bg-gray-900 dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-95 shadow-lg shadow-gray-200 dark:shadow-none"
                          : "bg-red-50 dark:bg-red-500/10 text-red-400 border border-red-100 dark:border-red-500/20 cursor-not-allowed"
                  }`}
                >
                  {isOwned ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check size={14} /> Obtenido
                    </span>
                  ) : canAfford ? (
                    "Adquirir"
                  ) : (
                    "Saldo Insuficiente"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem]">
          <p className="text-gray-400">
            Próximamente nuevos ítems en esta categoría...
          </p>
        </div>
      )}
    </div>
  );
};

export default YoMACStore;
