import { useState, useEffect } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Smile, X } from "lucide-react";
import useDarkMode from "@/hooks/useDarkMode";

export default function EmojiSelector({ addEmoji }) {
  const [showPicker, setShowPicker] = useState(false);
  const {darkMode} = useDarkMode()

  // Bloquear scroll en móvil cuando el picker está abierto
  useEffect(() => {
    if (showPicker && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showPicker]);

  return (
    <div className="relative">
      {/* Botón Disparador */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className={`p-2 rounded-full transition-colors ${
          showPicker 
            ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" 
            : "text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
        }`}
      >
        <Smile size={20} />
      </button>

      {showPicker && (
        <>
          {/* Overlay para cerrar al hacer clic fuera y oscurecer fondo en móvil */}
          {/* <div 
            className="fixed inset-0 z-60 bg-black/20 sm:bg-transparent sm:backdrop-blur-none"
            onClick={() => setShowPicker(false)}
          /> */}

          {/* Contenedor del Picker */}
          <div className={`
            fixed inset-x-0 bottom-0 z-200 animate-in slide-in-from-bottom duration-300
            sm:absolute sm:bottom-auto sm:top-full sm:left-0 sm:inset-x-auto sm:mt-3 sm:animate-in sm:zoom-in-95 sm:duration-150
          `}>
            
            {/* Header solo para móvil (estilo Drawer) */}
            {/* <div className="flex items-center justify-between p-4 bg-white dark:bg-[#151719] rounded-t-2xl border-b dark:border-neutral-800 sm:hidden">
               <span className="font-bold dark:text-white text-sm uppercase tracking-wider">Emojis</span>
               <button onClick={() => setShowPicker(false)} className="p-1 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                  <X size={18} className="dark:text-neutral-400" />
               </button>
            </div> */}

            <div className="shadow-2xl sm:shadow-xl overflow-hidden rounded-b-none sm:rounded-2xl ">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  addEmoji(emojiData);
                  // En móvil es mejor no cerrarlo para que sigan eligiendo, 
                  // pero si prefieres cerrar: if(window.innerWidth < 640) setShowPicker(false)
                }}
                theme={darkMode ? Theme.DARK : Theme.LIGHT}
                lazyLoadEmojis={true}
                // Ajustamos el ancho para que en móvil sea 100%
                width="100%"
                height={window.innerWidth < 640 ? "400px" : "450px"}
                searchPlaceholder="Buscar emoji..."
                previewConfig={{ showPreview: false }} // Ahorra espacio
                skinTonesDisabled
                autoFocusSearch={false}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}