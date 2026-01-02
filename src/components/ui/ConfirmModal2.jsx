import React from "react";

const ConfirmModal2 = ({onClose, onConfirm}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
       // onClick={() => setIsDeleteModalOpen(false)}
       onClick={()=>onClose(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-xl font-bold mb-2 dark:text-white text-center">
          ¿Borrar todo?
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
          Esta acción eliminará permanentemente todas tus notificaciones. No se
          puede deshacer.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onConfirm;
              onClose(false);
            }}
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
          >
            Sí, borrar todas
          </button>
          <button
            onClick={()=>onClose(false)}
            className="w-full py-3 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal2;
