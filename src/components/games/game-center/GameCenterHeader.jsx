import React, { useEffect, useState } from 'react'
import LeaderboardButton from './LeaderboardButton'
import { useNavigate } from 'react-router-dom'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { ArrowLeft, Gamepad2 } from 'lucide-react'
import IconButton from './IconButton'

const GameCenterHeader = () => {
    const navigate = useNavigate()
    const isMobile = useIsMobile()

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className={`
        ${isMobile ? "sticky top-[57px] z-30" : ""}
        bg-white/80 dark:bg-black/80 backdrop-blur-md
        border-b border-transparent
        transition-all duration-300
        ${isScrolled ? "p-4" : "p-3"}
      `}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <IconButton onClick={() => navigate("/")}>
                        <ArrowLeft size={20} className="dark:text-white" />
                    </IconButton>

                    <div>
                        <h1 className="text-3xl font-black dark:text-white flex items-center gap-2">
                            Arcade <Gamepad2 className="text-emerald-500" />
                        </h1>

                        {!isScrolled && (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Gana puntos y escala en el ranking de la comunidad.
                            </p>
                        )}
                    </div>
                </div>
                <LeaderboardButton onClick={() => navigate("/games/leaderboard")} />
            </div>
        </div>
    )
}

export default GameCenterHeader