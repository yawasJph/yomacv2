// Auxiliares estáticos para evitar errores de referencia
export const getDiffColor = (diff) => {
    switch (diff) {
      case "Fácil": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "Medio": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "Difícil": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };