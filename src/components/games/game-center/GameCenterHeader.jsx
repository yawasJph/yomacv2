import { useEffect, useState } from "react";
import LeaderboardButton from "./LeaderboardButton";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { ArrowLeft, Gamepad2, Volume2, VolumeX } from "lucide-react";
import IconButton from "./IconButton";
import { motion } from "framer-motion";

const GameCenterHeader = ({ isMuted, setIsMuted }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

            {/* {!isScrolled && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Gana puntos y escala en el ranking de la comunidad.
              </p>
            )} */}
          </div>
        </div>

        {/* Botón de Sonido con Animación */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 rounded-xl transition-colors relative ${
            isMuted
              ? "text-gray-500 bg-gray-50 dark:bg-gray-500/10"
              : "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
          }`}
        >
          {isMuted ? (
            <VolumeX size={20} />
          ) : (
            <div className="relative">
              <Volume2 size={20} />
              {/* Ondas de sonido animadas cuando NO está muteado */}
              <motion.span
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute inset-0 bg-emerald-400 rounded-full -z-10"
              />
            </div>
          )}
        </motion.button>

        <LeaderboardButton onClick={() => navigate("/games/leaderboard")} />
      </div>
    </div>
  );
};

export default GameCenterHeader;
