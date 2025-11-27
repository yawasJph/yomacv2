import React from "react";

const FallbackCard = ({ url }) => {

    // Inicializamos 'domain' con un valor por defecto.
    let domain = "Dominio no disponible"; 

    // Verificamos si la 'url' existe y es una cadena, luego intentamos crear el objeto URL.
    if (url && typeof url === 'string') {
        try {
            // Intentamos crear el objeto URL y obtener el dominio
            domain = new URL(url).hostname.replace("www.", "");
        } catch (e) {
            // Si falla, el error será capturado aquí, 
            // y 'domain' mantendrá su valor por defecto.
            console.error("Error al construir URL:", e, "URL inválida:", url);
        }
    }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full border rounded-xl p-4 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-3 mb-4"
    >
      <div className="w-10 h-10 bg-gray-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
        <svg
          className="w-6 h-6 text-gray-600 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 5v14m7-7H5" />
        </svg>
      </div>

      <div>
        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
          Vista previa no disponible
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 break-all" >{domain}</p>
      </div>
    </a>
  );
};

export default FallbackCard;
