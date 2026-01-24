import React, { useState } from 'react'
import { AnimatePresence, motion } from "framer-motion";
import { getDiffColor } from '../utils/getDiffColor';
import { ArrowRight, InfoIcon } from 'lucide-react';
import { useIsMobile } from '../../../hooks/useIsMobile';
import GameInfoModal from './GameInfoModal';

const GameCard = ({ game, index, onPath }) => {

    const isMobile = useIsMobile()
    const [infoGame, setInfoGame] = useState(null)

    return (
        <>
            <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onPath(game.path)}
                className={`group relative flex flex-col p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800/50 bg-linear-to-br ${game.color} hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 overflow-hidden cursor-pointer`}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setInfoGame(game);
                    }}
                    className={`absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md  hover:scale-110 active:scale-90 shadow-sm ${!isMobile && "opacity-0 group-hover:opacity-100 transition-all"}`}
                >
                    <InfoIcon size={20} className="text-emerald-500" />
                </button>

                <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-white dark:bg-gray-950 rounded-2xl shadow-xl shadow-black/5 group-hover:scale-110 transition-transform duration-500">
                        {game.icon}
                    </div>

                </div>

                <div className="flex-1">
                    <div className="flex justify-between gap-3 items-center">
                        <h3 className="text-xl font-black dark:text-white mb-2">{game.title}</h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${getDiffColor(game.difficulty)}`}>
                            {game.difficulty}
                        </span>
                    </div>


                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                        {game.description}
                    </p>
                </div>

                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
                    Comenzar Reto
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </div>

                {/* Decoración de fondo */}
                <div className="absolute -right-6 -bottom-6 opacity-[0.03] dark:opacity-[0.05] group-hover:rotate-12 group-hover:scale-125 transition-all duration-700 pointer-events-none">
                    {React.cloneElement(game.icon, { size: 160 })}
                </div>
            </motion.div>

            {/* game Info modal */}
            <AnimatePresence>
                {infoGame && (
                    <GameInfoModal game={infoGame} onClose={() => setInfoGame(null)} onPlay={() => onPath(infoGame.path)} />
                )}
            </AnimatePresence>
        </>
    )
}

export default GameCard