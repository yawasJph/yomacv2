import { Hash, Star, Timer } from "lucide-react";
import { memo } from "react";

// 1. Constantes de estilo para evitar el "mar de clases"
const CARD_BASE_STYLE = "p-3 sm:p-5 rounded-2xl border-2 transition-all flex flex-col items-center shadow-sm";
const LABEL_STYLE = "block text-[10px] uppercase font-bold tracking-wider mb-1";
const VALUE_STYLE = "text-xl sm:text-2xl font-black dark:text-white tabular-nums";


// 2. Sub-componente interno para evitar repetir código (DRY)
// Lo mantenemos en el mismo archivo porque es exclusivo del HUD
const HudCard = memo(({ icon: Icon, label, value, colorClass, iconColor }) => (
  <div className={`${CARD_BASE_STYLE} ${colorClass}`}>
    <Icon className={`${iconColor} mb-0.5 sm:mb-1`} size={18} />
    <span className={`${LABEL_STYLE} ${iconColor}`}>
      {label}
    </span>
    <span className={VALUE_STYLE}>
      {value}
    </span>
  </div>
));

const HudSection = memo(({ seconds, moves, score }) => {
  // Nota: El cálculo del score ahora viene por props. 
  // Esto es mejor porque el HUD no debería saber "cómo" se calcula el puntaje.

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
      <HudCard 
        icon={Timer} 
        label="Tiempo" 
        value={`${seconds}s`}
        colorClass="grand-blue"
        iconColor="text-blue-600 dark:text-blue-400"
      />

      <HudCard 
        icon={Hash} 
        label="Pasos" 
        value={moves}
        colorClass="grand-purple"
        iconColor="text-purple-600 dark:text-purple-400"
      />

      <HudCard 
        icon={Star} 
        label="Puntos" 
        value={score}
        colorClass="grand-yellow"
        iconColor="text-amber-600 dark:text-amber-400"
      />
    </div>
  );
});

export default HudSection;