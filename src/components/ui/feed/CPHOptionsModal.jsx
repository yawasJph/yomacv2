import { notify } from "@/utils/toast/notifyv3";
import { AlertCircle, Flag, MoreHorizontal, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const CPHOptionsModal = ({isMe, setIsDeleteModalOpen, handleReportAction , post}) => {
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative shrink-0"
      ref={optionsRef}
    >
      <button
        onClick={() => {
          setShowOptions(!showOptions);
        }}
        className="
                        w-8 h-8
                        flex items-center justify-center
                        rounded-full
                        text-gray-400
                        hover:bg-gray-100 dark:hover:bg-gray-800
                        transition-colors
                      "
      >
        <MoreHorizontal size={16} />
      </button>

      {showOptions && (
        <div
          className="
                          absolute right-0 mt-2 w-48
                          bg-white dark:bg-neutral-900
                          border border-gray-100 dark:border-gray-800
                          rounded-xl shadow-xl
                          z-50 overflow-hidden
                          animate-in fade-in zoom-in duration-100
                        "
          onClick={(e) => e.stopPropagation()}
        >
          {isMe ? (
            <button
              onClick={() => {
                setIsDeleteModalOpen(true);
                setShowOptions(false);
              }}
              className="
                                w-full flex items-center gap-3
                                px-4 py-3 text-sm
                                text-red-500
                                hover:bg-red-50 dark:hover:bg-red-500/10
                                transition-colors
                              "
            >
              <Trash2 size={16} />
              <span className="font-medium">Eliminar post</span>
            </button>
          ) : (
            <button
              onClick={() => {
                handleReportAction();
                setShowOptions(false);
              }}
              className="
                              w-full flex items-center gap-3
                              px-4 py-3 text-sm
                              text-gray-700 dark:text-gray-300
                              hover:bg-gray-50 dark:hover:bg-gray-800
                              transition-colors
                            "
            >
              <Flag size={16} />
              <span className="font-medium">Reportar contenido</span>
            </button>
          )}

          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/post/${post.id}`,
              );

              notify.success("Enlace copiado");
              setShowOptions(false);
            }}
            className="
                      w-full flex items-center gap-3
                              px-4 py-3 text-sm
                              text-gray-700 dark:text-gray-300
                              hover:bg-gray-50 dark:hover:bg-gray-800
                              transition-colors
                              border-t border-gray-100 dark:border-gray-800
                            "
          >
            <AlertCircle size={16} />
            <span className="font-medium">Copiar enlace</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CPHOptionsModal;
