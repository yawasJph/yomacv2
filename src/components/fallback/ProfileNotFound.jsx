import { messages } from '@/consts/notFound/notFoundProfile';
import React from 'react'
import { useNavigate } from 'react-router-dom';

const randomMessage = messages[Math.floor(Math.random() * messages.length)];

export const ProfileNotFound = () => {
    const navigate = useNavigate()
    const trollActions = [
    () => navigate("/"),
    () => navigate(-1),
    () => navigate("/games"),
    () => navigate("/users"),
    () => alert("Nada por aquí 👀"),
  ];
  return (
    <div className="min-h-[500px] sm:min-h-screen flex flex-col items-center justify-center text-center px-6">
        {/* ICONO */}
        <div className="bg-gray-100 dark:bg-neutral-800 p-6 rounded-full mb-6 cursor-pointer hover:scale-105 transition">
          🕵️
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {randomMessage.title}
        </h2>

        {/* DESC */}
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
          {randomMessage.desc}
        </p>

        {randomMessage.desc2 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
            {randomMessage.desc2}
          </p>
        )}

        {/* BUTTONS */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-gray-200 dark:bg-neutral-700 rounded-full hover:scale-105 transition dark:text-white"
          >
            {randomMessage.btnBack ?? "Volver"}
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition"
          >
            {randomMessage.btnHome ?? "Inicio"}
          </button>

          <button
            onClick={() => navigate("/users")}
            className="px-5 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
          >
            {randomMessage.btnExplore ?? "Explorar 🔍"}
          </button>

          <button
            onClick={() => {
              const action =
                trollActions[Math.floor(Math.random() * trollActions.length)];
              action();
            }}
            className="px-5 py-2 bg-pink-500 text-white rounded-full hover:scale-105 transition"
          >
            {randomMessage.btnTroll ?? "??? 🎲"}
          </button>
        </div>

        {/* EXTRA */}
        {randomMessage.extra && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-8">
            {randomMessage.extra}
          </p>
        )}
      </div>
  )
}
