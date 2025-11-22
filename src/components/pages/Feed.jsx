import {
  Bookmark,
  Heart,
  Image,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";

const Feed = () => {
  const [profiles, setProfiles] = useState([]);

  const getProfiles = async () => {
    const { data: profiles, error } = await supabaseClient.from("profiles").select("*");
    setProfiles(profiles);
    if (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getProfiles();
  }, [profiles]);

  return (
    <>
      <div className="bg-white dark:bg-black rounded-2xl shadow-sm shadow-emerald-500/10 dark:shadow-emerald-500/20 border-2 border-emerald-500/20 dark:border-emerald-500/30 p-5 hover:border-emerald-500/40 dark:hover:border-emerald-500/50 transition-all duration-300">
        <div className="flex gap-3">
          {/* Avatar */}
          <img
            src={"/default-avatar.jpg"}
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover border border-gray-300 dark:border-gray-700"
          />

          {/* Formulario */}
          <div className="flex-1">
            <textarea
              placeholder="¿Qué estás pensando?"
              rows={3}
              className="w-full resize-none bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200"
            />

            {/* Imagen seleccionada */}

            {/* Acciones */}
            <div className="flex justify-between items-center mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
              <label
                className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition cursor-pointer"
                title="subir imagen"
              >
                <Image size={20} />
                <input type="file" accept="image/*" className="hidden" />
              </label>

              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-70 transition cursor-pointer"
              >
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publicando...</span>
                </>
              </button>
            </div>
          </div>
        </div>
      </div>
      {profiles.map((profile) => (
      <div className="bg-white dark:bg-black rounded-2xl shadow-sm shadow-emerald-500/10 dark:shadow-emerald-500/20 border-2 border-emerald-500/20 dark:border-emerald-500/30 p-5 hover:border-emerald-500/40 dark:hover:border-emerald-500/50 transition-all duration-300 mt-6">
       
        <div className="flex gap-3 items-start w-full">
          {/* 🧩 Avatar a la izquierda */}
          <img
            src={"/default-avatar.jpg"}
            alt="avatar"
            className="w-11 h-11 rounded-full object-cover shrink-0"
          />

          {/* 🧩 Contenido del post */}
          <div className="flex-1 min-w-0 w-full">
            {/* Encabezado con nombre, fecha y menú */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  {profile.full_name}
                </h3>
                <p className="text-xs text-gray-500">hoy</p>
              </div>

              {/* Menú de opciones */}

              <div className="relative">
                <button
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                  title="acciones"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* Contenido del texto */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 wrap-break-word whitespace-pre-wrap overflow-hidden break-all max-w-full">
              hola
            </p>

            {/* Imagen del post */}

            <>
              <img
                src={"logo.png"}
                alt="post"
                className="rounded-lg mt-3 cursor-pointer hover:opacity-90 transition w-full object-contain max-h-[500px]"
              />
            </>

            {/* Acciones */}
            <div className="flex justify-between items-center mt-3 text-gray-500 dark:text-gray-400 text-sm">
              <Heart size={16} />

              <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition text-sm cursor-pointer">
                <MessageCircle size={17} />
              </button>

              <button
                className={`flex items-center gap-1 transition cursor-pointer text-emerald-600 
                  `}
              >
                <Bookmark size={17} />
              </button>
            </div>
            </div>
          </div>
        
      </div>
      ))}
    </>
  );
};

export default Feed;
