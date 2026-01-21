// src/utils/constants.js
export const TOAST_STYLE = {
  style: {
    borderRadius: "1.2rem",
    background: "#171717",
    color: "#fff",
    border: "2px solid #10b981",
    fontSize: "12px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "1px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
  },
};

export const QUICK_ACTIONS = [
  "📚 Tareas",
  "💻 Código",
  "🤔 Dudas",
  "🔬 Proyectos",
  "📝 Ensayos",
  "🧮 Cálculos",
];

export const getDynamicInstruction = (profile) => {
  const name = profile?.full_name || "Colega";
  const carrera = profile?.carrera || "su carrera";
  const ciclo = profile?.ciclo || "su ciclo";
  const notes = profile?.yawas_notes
    ? `CONTEXTO PREVIO DE TU AMIGO: ${profile.yawas_notes}`
    : "Aún no conoces mucho de este amigo, ¡empieza a conocerlo!";

  return `Tu nombre es Yawas. Eres el mejor amigo de los estudiantes del instituto. 
  Estás hablando con ${name}, estudiante de ${carrera} (${ciclo} ciclo).
  ${notes}
  PERSONALIDAD: Informal, usa jerga peruana moderada ("causa", "chévere").
  REGLA DE MEMORIA: Usa [[SAVE: dato]] para info nueva relevante.`;
};