import { useNavigate } from "react-router-dom";
import { useAuthAction } from "../../hooks/useAuthAction";
import { GAMES_LIST } from "../../components/games/utils/GAMES_LIST";
import GameCard from "../../components/games/game-center/GameCard";
import GameCenterHeader from "../../components/games/game-center/GameCenterHeader";
import useSound from "use-sound"; // 1. Importar la librería
import { useEffect } from "react";
import { useAudio } from "../../context/AudioContext";

const GameCenter = () => {
  const navigate = useNavigate();
  const { executeAction } = useAuthAction();
  //const [isMuted, setIsMuted] = useState(false);
  const {isMuted, setIsMuted} = useAudio()

  // 1. Elegimos una canción al azar al cargar el componente
  // Usamos useMemo para que el número no cambie cada vez que el componente se re-renderice
  //const randomTrack = useMemo(() => Math.floor(Math.random() * 7) + 1, []);
  const trackPath = `/sounds/bgv1.mp3`;

  // 2. Configuramos useSound para música de fondo
  const [play, { stop, sound }] = useSound(trackPath, {
    volume: 0.5, // Volumen bajo para que no aturda
    interrupt: true, // Interrumpe otros sonidos si fuera necesario
    loop: true, // ¡Importante! Para que la música no se corte
  });

  // 3. Control maestro de la música (Play/Stop/Mute)
  useEffect(() => {
    if (!isMuted) {
      play();
    } else {
      stop();
    }

    // Cleanup: Detener la música cuando el usuario salga del GameCenter
    return () => stop();
  }, [isMuted, play, stop]);

  const handleGameNavigate = (path) => {
    // Detenemos la música antes de navegar para que no se filtre al juego
    stop();
    executeAction(() => navigate(path), "para jugar");
  };

  return (
    <div className="bg-white dark:bg-black p-4 ">
      {/* min-h-screen */}

      {/* Header */}
      <GameCenterHeader isMuted={isMuted} setIsMuted={setIsMuted} />

      {/* grid game cards*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GAMES_LIST.map((game, index) => (
          <GameCard game={game} index={index} onPath={handleGameNavigate} />
        ))}
      </div>

      {/* Sección de "Próximamente" o Stats rápidas */}
      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
        <p className="text-gray-500 text-sm italic">
          Nuevos desafíos cada semana. ¡Mantente atento!
        </p>
      </div>

      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
        <p className="text-gray-500 text-sm italic">
          Estás escuchando: Track {/** */} {isMuted && "(Silenciado)"}
        </p>
      </div>
    </div>
  );
};

export default GameCenter;
