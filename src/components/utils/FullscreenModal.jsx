import React from "react";

const FullscreenModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-9999 bg-black/60 backdrop-blur-md flex justify-center items-center"
      onClick={onClose}
    >
      {/* Contenido del modal */}
      <div
        className="bg-white dark:bg-gray-900 w-full h-full sm:h-[90%] sm:w-[90%] md:w-[70%] lg:w-[50%] rounded-none sm:rounded-2xl shadow-xl overflow-y-auto animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        
      </div>
    </div>
  );
};

export default FullscreenModal;
