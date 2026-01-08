import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../supabase/supabaseClient';
import { useAuth } from '../context/AuthContext';

const StickerSelector = ({ onSelectSticker }) => {
  const { user } = useAuth();
  const [myStickers, setMyStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchMyStickers = async () => {
      const { data, error } = await supabaseClient
        .from('user_badges')
        .select(`
          badges (
            id, name, resource_url, category
          )
        `)
        .eq('user_id', user.id)
        .eq('badges.category', 'sticker'); // Solo stickers

      if (data) {
        // Limpiamos la data anidada
        const stickers = data.map(item => item.badges).filter(b => b !== null);
        setMyStickers(stickers);
      }
      setLoading(false);
    };

    if (isOpen) fetchMyStickers();
  }, [isOpen, user.id]);

  return (
    <div className="relative">
      {/* Botón para abrir el selector */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        title="Añadir sticker"
      >
        <span className="text-xl">🖼️</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-12 left-0 w-72 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
            <span className="text-sm font-bold">Mis Stickers</span>
            <button onClick={() => setIsOpen(false)} className="text-xs text-gray-500">Cerrar</button>
          </div>

          <div className="h-60 overflow-y-auto p-3">
            {loading ? (
              <div className="flex justify-center py-10 italic text-gray-400">Cargando...</div>
            ) : myStickers.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {myStickers.map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => {
                      onSelectSticker(sticker.resource_url);
                      setIsOpen(false);
                    }}
                    className="hover:bg-gray-100 dark:hover:bg-neutral-800 p-1 rounded-lg transition-transform active:scale-90"
                  >
                    <img src={sticker.resource_url} alt={sticker.name} className="w-full h-auto object-contain" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-gray-500">No tienes stickers aún.</p>
                <button className="text-xs text-emerald-500 font-bold mt-2">Ir a la tienda</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StickerSelector;