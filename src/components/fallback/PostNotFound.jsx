import { messages } from "@/consts/notFound/noFoundPost";
import { X } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const randomMessage = messages[Math.floor(Math.random() * messages.length)];

export const PostNotFound = () => {
  const navigate = useNavigate();
  const trollActions = [
    () => navigate("/"),
    () => navigate(-1),
    () => navigate("/games"),
    () => alert("Nada por aquí 👀"),
  ];
  return (
    <div className="bg-white dark:bg-black min-h-[500px] md:min-h-dvh flex flex-col">
      {/* ESTADO VACÍO */}
      <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
        {/* ICONO */}
        <div className="bg-gray-100 dark:bg-neutral-800 p-6 rounded-full mb-6 cursor-pointer select-none">
          <X size={42} className="text-gray-500" />
        </div>

        {/* TITULO */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {randomMessage.title}
        </h2>

        {/* DESCRIPCIÓN */}
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6 leading-relaxed">
          {randomMessage.desc}
          <br />
          <span className="text-sm opacity-70">{randomMessage.desc2}</span>
        </p>

        {/* BOTONES */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-gray-200 dark:bg-neutral-700 rounded-full hover:scale-105 hover:bg-gray-300 dark:hover:bg-neutral-600 transition-all dark:text-white"
          >
            {randomMessage.btnBack}
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 hover:scale-105 transition-all shadow-sm"
          >
            {randomMessage.btnHome}
          </button>

          <button
            onClick={() => navigate("/games")}
            className="px-5 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 hover:scale-105 transition-all shadow-sm"
          >
            {randomMessage.btnGame}
          </button>

          <button
            onClick={() => {
              const action =
                trollActions[Math.floor(Math.random() * trollActions.length)];
              action();
            }}
            className="px-5 py-2 bg-pink-500 text-white rounded-full hover:scale-105 transition"
          >
            {randomMessage.btnTroll}
          </button>
        </div>

        {/* EXTRA DETALLE */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-8">
          {randomMessage.extra}
        </p>
      </div>
    </div>
  );
};
