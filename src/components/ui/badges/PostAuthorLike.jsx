import { Heart } from "lucide-react";
import React from "react";

const PostAuthorLike = ({avatar}) => {
  return (
    <div className="absolute bottom-2 right-4 flex items-center gap-1 bg-white dark:bg-black p-1 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="relative">
        {/* Foto en miniatura del creador del post */}
        <img
          src={avatar || "/default-avatar.png"}
          alt="Autor"
          className="w-5 h-5 rounded-full border border-white dark:border-gray-900"
        />
        {/* Corazoncito superpuesto */}
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-0.5">
          <Heart size={10} className="text-red-500 fill-red-500" />
        </div>
      </div>
      {/* <span className="text-[10px] font-medium text-gray-500 pr-1 hidden sm:inline">
                  Le gustó al autor
                </span> */}
    </div>
  );
};

export default PostAuthorLike;
