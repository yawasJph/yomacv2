import React, { useState, useMemo, useCallback, memo } from "react";
import { useStoreData } from "../../hooks/useStore"; // El hook que creamos
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
// ... (mismos imports de iconos)
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
import StoreSkeleton from "../../components/skeletons/StoreSkeleton";

// 1. Sub-componente Memoizado para las tarjetas
const StoreItem = memo(
  ({ item, isOwned, canAfford, isWrongCarrera, onBuy }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative bg-gray-50/50 dark:bg-white/2 border border-gray-100 dark:border-white/5 p-5 rounded-[2.5rem] flex flex-col items-center text-center transition-all hover:shadow-2xl hover:shadow-emerald-500/10"
    >
      {/* ... (Lógica de Badge de Carrera que ya tenías) ... */}
      {item.carrera_restriccion && (
        <div className="absolute -top-1 -right-1 z-20">
          <div className="relative group/badge">
            {/* Resplandor de fondo animado */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-30 group-hover/badge:opacity-100 transition duration-1000 group-hover/badge:duration-200 animate-tilt"></div>

            {/* Cuerpo del Badge */}
            <span className="relative flex items-center gap-1 bg-white/80 dark:bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-tighter bg-linear-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {item.carrera_restriccion}
              </span>
            </span>
          </div>
        </div>
      )}

      <div className="mb-4 relative">
        <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full scale-0 group-hover:scale-110 transition-transform duration-500" />
        {item.category === "badge" ? (
          <span className="text-5xl block relative drop-shadow-sm group-hover:rotate-12 transition-transform">
            {item.icon}
          </span>
        ) : (
          <img
            src={item.resource_url}
            alt={item.name}
            className="w-24 h-24 object-contain relative z-10 group-hover:scale-110 transition-transform"
            loading="lazy"
          />
        )}
      </div>

      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">
        {item.name}
      </h3>

      <div className="flex items-center gap-1.5 mb-4">
        <span className="text-emerald-500 font-black text-base">
          {item.price.toLocaleString()}
        </span>
        <span className="text-[10px] font-bold text-gray-400 uppercase">
          Credits
        </span>
      </div>

      <button
        disabled={isOwned || !canAfford || isWrongCarrera}
        onClick={() => onBuy(item.id)}
        className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
          isWrongCarrera
            ? "bg-gray-100 text-gray-400"
            : isOwned
              ? "bg-gray-50 dark:bg-gray-800 text-gray-400"
              : canAfford
                ? "bg-gray-900 dark:bg-white text-white dark:text-black hover:scale-[1.02]"
                : "bg-red-50 dark:bg-red-500/10 text-red-400"
        }`}
      >
        {isOwned ? "Obtenido" : canAfford ? "Adquirir" : "Saldo Insuficiente"}
      </button>
    </motion.div>
  ),
);

const YoMACStore = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { data: userProfile } = useProfile(currentUser?.id);

  // Estados Locales
  const [activeTab, setActiveTab] = useState("badge");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // React Query: Datos de la tienda
  const { data, isLoading } = useStoreData(currentUser?.id);
  const items = data?.items || [];
  const myItems = data?.myItems || [];

  // Mutación para compra
  const buyMutation = useMutation({
    mutationFn: async (itemId) => {
      const { error } = await supabaseClient.rpc("buy_badge", {
        p_badge_id: itemId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("¡Adquisición completada!");
      queryClient.invalidateQueries(["store"]); // Refresca la caché
      queryClient.invalidateQueries(["profile"]); // Refresca los créditos del usuario
    },
    onError: (error) => toast.error(error.message),
  });

  // 2. Filtrado Memoizado (No se recalcula si cambias de pestaña a menos que cambien los datos)
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (item.category !== activeTab) return false;
        if (filter === "carrera")
          return item.carrera_restriccion === userProfile?.carrera;
        if (filter === "affordable")
          return (
            item.price <= (userProfile?.credits || 0) &&
            !myItems.includes(item.id)
          );
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [items, activeTab, filter, sortBy, userProfile, myItems]);

  const handleBuy = useCallback(
    (itemId) => {
      buyMutation.mutate(itemId);
    },
    [buyMutation],
  );

  const categories = [
    { id: "badge", label: "Insignias", icon: <Sparkles size={18} /> },
    { id: "sticker", label: "Stickers", icon: <ImageIcon size={18} /> },
    { id: "gif", label: "Gifs Animados", icon: <Gift size={18} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
      {/* HEADER (Reutiliza tu diseño, pero usa userProfile.credits directamente) */}
      <HeaderSection navigate={navigate} credits={userProfile?.credits || 0} />

      {/* TABS (Memoizados por CSS o extraídos) */}
      <nav className="flex gap-2 mb-8 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-fit">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === cat.id
                ? "bg-white dark:bg-gray-800 text-emerald-500 shadow-sm"
                : "text-gray-500"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </nav>

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

      {/* GRID OPTIMIZADA */}
      {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <AnimatePresence>
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            filteredItems.map((item) => (
              <StoreItem
                key={item.id}
                item={item}
                isOwned={myItems.includes(item.id)}
                canAfford={(userProfile?.credits || 0) >= item.price}
                isWrongCarrera={
                  item.carrera_restriccion &&
                  item.carrera_restriccion !== userProfile?.carrera
                }
                onBuy={handleBuy}
              />
            ))
          )}
        </AnimatePresence>
      </div> */}
      {/* GRID DE PRODUCTOS */}
      <div className="min-h-[400px]">
        {" "}
        {/* Altura mínima para evitar saltos de layout */}
        {isLoading ? (
          <StoreSkeleton />
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <StoreItem
                  key={item.id}
                  item={item}
                  isOwned={myItems.includes(item.id)}
                  canAfford={(userProfile?.credits || 0) >= item.price}
                  isWrongCarrera={
                    item.carrera_restriccion &&
                    item.carrera_restriccion !== userProfile?.carrera
                  }
                  onBuy={handleBuy}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem]"
          >
            <p className="text-gray-400 font-medium">
              Próximamente nuevos ítems en esta categoría...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const HeaderSection = memo(({ navigate, credits }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ">
      <div>
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
            {credits.toLocaleString()}
            <span className="text-xs font-medium text-gray-500">CC</span>
          </p>
        </div>
      </div>
    </div>
  );
});

const SkeletonLoader = memo(() => {
  return <p>cargando...</p>;
});

export default YoMACStore;
