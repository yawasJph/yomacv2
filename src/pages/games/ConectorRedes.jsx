import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, RotateCcw, Zap, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
//import { LEVELS } from "../../assets/data-game/c-lvl";

const LEVELS = [
  {
    id: 1,
    name: "Sótano IT",
    size: 5,
    pairs: [
      { id: "red", color: "#ef4444", start: [4, 0], end: [2, 3] },
      { id: "blue", color: "#3b82f6", start: [2, 2], end: [0, 4] },
      { id: "green", color: "#10b981", start: [1, 0], end: [3, 2] },
      { id: "yellow", color: "#f59e0b", start: [0, 0], end: [2, 1] },
      { id: "purple", color: "#a855f7", start: [1, 3], end: [4, 4] },
    ],
  },

  {
    id: 2,
    name: "Rack Inicial",
    size: 5,
    pairs: [
      { id: "red", color: "#ef4444", start: [3, 1], end: [4, 4] },
      { id: "blue", color: "#3b82f6", start: [3, 0], end: [1, 2] },
      { id: "green", color: "#10b981", start: [4, 0], end: [4, 2] },
      { id: "yellow", color: "#f59e0b", start: [1, 1], end: [0, 3] },
      { id: "purple", color: "#a855f7", start: [0, 4], end: [3, 4] },
    ],
  },

  // {
  //   id: 3,
  //   name: "Cableado Básico",
  //   size: 6,
  //   pairs: [
  //     { id: "red", color: "#ef4444", start: [1, 0], end: [1, 3] },
  //     { id: "blue", color: "#3b82f6", start: [4, 2], end: [3, 4] },
  //     { id: "green", color: "#10b981", start: [0, 4], end: [3, 3] },
  //     { id: "yellow", color: "#f59e0b", start: [1, 1], end: [3, 1] },
  //     { id: "purple", color: "#a855f7", start: [2, 1], end: [4, 1] },
  //   ],
  // },

  // {
  //   id: 4,
  //   name: "Red Local",
  //   size: 6,
  //   pairs: [
  //     { id: "red", color: "#ef4444", start: [1, 2], end: [3, 4] },
  //     { id: "blue", color: "#3b82f6", start: [0, 0], end: [2, 0] },
  //     { id: "green", color: "#10b981", start: [3, 0], end: [3, 3] },
  //     { id: "yellow", color: "#f59e0b", start: [0, 4], end: [2, 3] },
  //     { id: "purple", color: "#a855f7", start: [4, 0], end: [4, 4] },
  //   ],
  // },
  {
    id: 5,
    name: "Data Center",
    size: 7,
    pairs: [
      { id: "red", color: "#ef4444", start: [1, 2], end: [3, 4] },
      { id: "blue", color: "#3b82f6", start: [0, 0], end: [2, 0] },
      { id: "green", color: "#10b981", start: [3, 0], end: [3, 3] },
      { id: "yellow", color: "#f59e0b", start: [0, 4], end: [2, 3] },
      { id: "purple", color: "#a855f7", start: [4, 0], end: [4, 4] },
    ],
  },

  {
    id: 6,
    name: "Switch Core",
    size: 7,
    pairs: [
      { id: "red", color: "#ef4444", start: [1, 2], end: [3, 4] },
      { id: "blue", color: "#3b82f6", start: [0, 0], end: [2, 0] },
      { id: "green", color: "#10b981", start: [3, 0], end: [3, 3] },
      { id: "yellow", color: "#f59e0b", start: [0, 4], end: [2, 3] },
      { id: "purple", color: "#a855f7", start: [4, 0], end: [4, 4] },
    ],
  },
];

const ConectorRedes = ({ onBack }) => {
  const { user } = useAuth();
  const [level, setLevel] = useState(LEVELS[0]);
  const [grid, setGrid] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(null);
  const [paths, setPaths] = useState({});
  const [completed, setCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  // Inicializar tablero
  useEffect(() => {
    const newGrid = Array(level.size)
      .fill(null)
      .map(() => Array(level.size).fill(null));
    level.pairs.forEach((p) => {
      newGrid[p.start[0]][p.start[1]] = {
        type: "node",
        colorId: p.id,
        color: p.color,
      };
      newGrid[p.end[0]][p.end[1]] = {
        type: "node",
        colorId: p.id,
        color: p.color,
      };
    });
    setGrid(newGrid);
    setPaths(level.pairs.reduce((acc, p) => ({ ...acc, [p.id]: [] }), {}));
    setTimer(0);
    setCompleted(false);
  }, [level]);

  // Timer
  useEffect(() => {
    let interval;
    if (!completed) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [completed]);

  const startDrawing = (r, c, cell) => {
    if (!cell || cell.type !== "node") return;
    // NUEVO: Si el nodo ya tenía un camino, lo limpiamos para empezar de nuevo ese color
    setPaths((prev) => ({
      ...prev,
      [cell.colorId]: [[r, c]], // Resetea el camino a solo el punto inicial
    }));
    setIsDrawing(true);
    setCurrentColor(cell.colorId);
    // setPaths((prev) => ({ ...prev, [cell.colorId]: [[r, c]] }));
  };

  // --- LÓGICA DE DIBUJO CORREGIDA ---
  const draw = useCallback(
    (r, c) => {
      if (!isDrawing || !currentColor) return;

      setPaths((prev) => {
        const currentPath = prev[currentColor];
        const last = currentPath[currentPath.length - 1];

        // 1. Evitar repetir la misma celda
        if (last[0] === r && last[1] === c) return prev;

        // 2. Solo permitir movimientos adyacentes (no diagonales)
        const dist = Math.abs(last[0] - r) + Math.abs(last[1] - c);
        if (dist !== 1) return prev;

        // 3. VALIDACIÓN ANTI-TRAMPAS:
        // ¿La celda está ocupada por OTRO color?
        const isOccupiedByOther = Object.keys(prev).some(
          (colorId) =>
            colorId !== currentColor &&
            prev[colorId].some((p) => p[0] === r && p[1] === c),
        );
        if (isOccupiedByOther) return prev; // Bloquea el cruce

        // 4. Lógica de nodos
        const targetCell = grid[r][c];
        if (
          targetCell &&
          targetCell.type === "node" &&
          targetCell.colorId !== currentColor
        ) {
          return prev; // Bloquea chocar con nodos de otro color
        }

        // 5. Auto-recorte (si vuelves sobre tu propio camino)
        const existingIdx = currentPath.findIndex(
          (p) => p[0] === r && p[1] === c,
        );
        if (existingIdx !== -1) {
          return {
            ...prev,
            [currentColor]: currentPath.slice(0, existingIdx + 1),
          };
        }

        return { ...prev, [currentColor]: [...currentPath, [r, c]] };
      });
    },
    [isDrawing, currentColor, grid],
  );

  // --- SOPORTE TÁCTIL (MOVIL) ---
  const handleTouchMove = (e) => {
    if (!isDrawing) return;

    // Obtenemos las coordenadas del toque
    const touch = e.touches[0];
    // Buscamos el elemento bajo el dedo
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    // Extraemos las coordenadas que guardamos en data-cell
    const cellData = element?.closest("[data-cell]")?.getAttribute("data-cell");

    if (cellData) {
      const [r, c] = cellData.split("-").map(Number);
      draw(r, c);
    }
  };
  const stopDrawing = () => {
    setIsDrawing(false);
    setCurrentColor(null);
  };

  // Validación de victoria mejorada
  useEffect(() => {
    const checkWin = () => {
      const allConnected = level.pairs.every((pair) => {
        const path = paths[pair.id] || [];
        if (path.length < 2) return false;
        const first = path[0];
        const last = path[path.length - 1];
        return (
          (first[0] === pair.start[0] &&
            first[1] === pair.start[1] &&
            last[0] === pair.end[0] &&
            last[1] === pair.end[1]) ||
          (first[0] === pair.end[0] &&
            first[1] === pair.end[1] &&
            last[0] === pair.start[0] &&
            last[1] === pair.start[1])
        );
      });

      if (allConnected) {
        const occupiedCells = new Set();
        Object.values(paths).forEach((path) =>
          path.forEach((p) => occupiedCells.add(`${p[0]}-${p[1]}`)),
        );
        if (occupiedCells.size === level.size * level.size && !completed) {
          setCompleted(true);
          saveScore();
        }
      }
    };
    checkWin();
  }, [paths]);

  const saveScore = async () => {
    // Cálculo: Base según tamaño del tablero - tiempo empleado
    const basePoints = level.size * 200;
    const timePenalty = timer * 2;
    const levelScore = Math.max(basePoints - timePenalty, 100);

    const newTotal = totalScore + levelScore;
    setTotalScore(newTotal);

    // Si es el último nivel, guardamos en la DB el total
    const currentIndex = LEVELS.findIndex((l) => l.id === level.id);
    if (currentIndex === LEVELS.length - 1) {
      await supabaseClient.from("leaderboards").insert({
        user_id: user.id,
        game_id: "redes_campus",
        score: newTotal,
      });
      toast.info(newTotal)
      setGameFinished(true); // Activamos pantalla final
    }
  };

  const isConnected = (colorId, r, c, tr, tc) => {
    const path = paths[colorId] || [];
    for (let i = 0; i < path.length - 1; i++) {
      const curr = path[i];
      const next = path[i + 1];
      if (
        (curr[0] === r && curr[1] === c && next[0] === tr && next[1] === tc) ||
        (next[0] === r && next[1] === c && curr[0] === tr && curr[1] === tc)
      )
        return true;
    }
    return false;
  };

  const closedColors = useMemo(() => {
    return level.pairs
      .filter((pair) => {
        const path = paths[pair.id] || [];
        if (path.length < 2) return false;
        const f = path[0],
          l = path[path.length - 1];
        return (
          (f[0] === pair.start[0] &&
            f[1] === pair.start[1] &&
            l[0] === pair.end[0] &&
            l[1] === pair.end[1]) ||
          (f[0] === pair.end[0] &&
            f[1] === pair.end[1] &&
            l[0] === pair.start[0] &&
            l[1] === pair.start[1])
        );
      })
      .map((p) => p.id);
  }, [paths, level]);

  const flowPercentage = Math.round(
    (new Set(
      Object.values(paths)
        .flat()
        .map((p) => `${p[0]}-${p[1]}`),
    ).size /
      (level.size * level.size)) *
      100,
  );

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col h-full bg-neutral-950 rounded-[2.5rem] text-white select-none relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Redes Campus
          </h2>
          <div className="flex items-center gap-2 justify-center text-neutral-500 font-mono text-xs">
            <Clock size={12} /> <span>{timer}s</span>
          </div>
        </div>
        <button
          onClick={() =>
            setPaths(
              level.pairs.reduce((acc, p) => ({ ...acc, [p.id]: [] }), {}),
            )
          }
          className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Grid */}
      <div
        className="aspect-square w-full grid gap-1 bg-neutral-900 p-2 rounded-3xl border border-neutral-800 relative"
        style={{
          gridTemplateColumns: `repeat(${level.size}, 1fr)`,
          touchAction: "none", // <--- EVITA QUE LA PANTALLA SE MUEVA AL DIBUJAR
        }}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchMove={handleTouchMove} // <--- ACTIVA EL DIBUJO TÁCTIL
        onTouchEnd={stopDrawing}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const activeColorId = Object.keys(paths).find((id) =>
              paths[id].some((p) => p[0] === r && p[1] === c),
            );
            const colorData = level.pairs.find((p) => p.id === activeColorId);
            const isClosed = closedColors.includes(activeColorId);

            return (
              <div
                key={`${r}-${c}`}
                data-cell={`${r}-${c}`} // <--- IDENTIFICADOR PARA document.elementFromPoint
                onMouseDown={() => startDrawing(r, c, cell)}
                onMouseEnter={() => draw(r, c)}
                onTouchStart={(e) => {
                  // Prevenir comportamientos extraños en móvil
                  startDrawing(r, c, cell);
                }}
                //className="relative w-full h-full bg-neutral-950 rounded-lg flex items-center justify-center pointer-events-auto"
                className={`relative w-full h-full bg-neutral-950 rounded-lg flex items-center justify-center 
                 ${!activeColorId ? 'after:content-[""] after:w-1 after:h-1 after:bg-neutral-800 after:rounded-full' : ""}`}
              >
                {activeColorId && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
                    <g
                      stroke={colorData.color}
                      strokeWidth={isClosed ? "10" : "6"}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    >
                      {r > 0 && isConnected(activeColorId, r, c, r - 1, c) && (
                        <line x1="50%" y1="50%" x2="50%" y2="0%" />
                      )}
                      {r < level.size - 1 &&
                        isConnected(activeColorId, r, c, r + 1, c) && (
                          <line x1="50%" y1="50%" x2="50%" y2="100%" />
                        )}
                      {c > 0 && isConnected(activeColorId, r, c, r, c - 1) && (
                        <line x1="50%" y1="50%" x2="0%" y2="50%" />
                      )}
                      {c < level.size - 1 &&
                        isConnected(activeColorId, r, c, r, c + 1) && (
                          <line x1="50%" y1="50%" x2="100%" y2="50%" />
                        )}
                    </g>
                  </svg>
                )}
                {cell?.type === "node" && (
                  <div
                    className="w-5 h-5 rounded-full z-10"
                    style={{
                      backgroundColor: cell.color,
                      boxShadow: `0 0 15px ${cell.color}99`,
                    }}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-neutral-900/50 p-4 rounded-3xl border border-neutral-800 backdrop-blur-sm">
          <p className="text-[10px] text-neutral-500 uppercase font-black mb-1 tracking-tighter">
            Nodos Activos
          </p>
          <p className="text-2xl font-black text-white">
            {closedColors.length} <span className="text-neutral-700">/</span>{" "}
            {level.pairs.length}
          </p>
        </div>

        <div className="bg-neutral-900/50 p-4 rounded-3xl border border-neutral-800 backdrop-blur-sm">
          <p className="text-[10px] text-neutral-500 uppercase font-black mb-1 tracking-tighter">
            Capa de Enlace
          </p>
          <p
            className={`text-2xl font-black transition-colors ${flowPercentage === 100 ? "text-emerald-500" : "text-blue-400"}`}
          >
            {flowPercentage}%
          </p>
        </div>
      </div>

      {/* Win Modal */}
      <AnimatePresence>
        {completed && (
          <motion.div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-neutral-900 border-2 border-blue-500 p-8 rounded-[3rem] text-center w-full shadow-[0_0_50px_rgba(59,130,246,0.3)]"
            >
              {!gameFinished ? (
                <>
                  <CheckCircle2
                    size={60}
                    className="text-emerald-500 mx-auto mb-4"
                  />
                  <h3 className="text-2xl font-black uppercase mb-2 text-white">
                    ¡Servidor Online!
                  </h3>
                  <p className="text-blue-400 font-mono text-xl mb-6">
                    +{Math.max(level.size * 200 - timer * 2, 100)} pts
                  </p>
                  <button
                    onClick={() => {
                      const currentIndex = LEVELS.findIndex(
                        (l) => l.id === level.id,
                      );
                      setLevel(LEVELS[currentIndex + 1]);
                    }}
                    className="w-full bg-blue-500 text-white py-4 rounded-2xl font-black uppercase active:scale-95 transition-all"
                  >
                    Siguiente Nodo
                  </button>
                </>
              ) : (
                <>
                  <Zap
                    size={60}
                    className="text-yellow-400 mx-auto mb-4 fill-yellow-400"
                  />
                  <h3 className="text-3xl font-black uppercase mb-2 text-white">
                    Master IT
                  </h3>
                  <p className="text-neutral-400 text-sm mb-1 uppercase">
                    Puntaje Total de Red
                  </p>
                  <p className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-blue-500 mb-8">
                    {totalScore}
                  </p>
                  <button
                    onClick={onBack}
                    className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase active:scale-95 transition-all"
                  >
                    Finalizar Turno
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConectorRedes;
