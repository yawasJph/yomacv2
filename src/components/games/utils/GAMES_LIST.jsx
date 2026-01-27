import { Bomb, Brain, CombineIcon, Container, Gamepad2, Grid3X3, Hash, Target, Type } from "lucide-react";

export const GAMES_LIST = [
    {
      id: "memory",
      title: "Memorama",
      description: "Encuentra las parejas de los perfiles más populares.",
      icon: <Grid3X3 className="text-emerald-500" size={32} />,
      color: "from-emerald-500/20 to-emerald-500/5",
      path: "/games/memory",
      difficulty: "Fácil",
      howToPlay: [
        "Voltea dos cartas para encontrar fotos o iconos idénticos.",
        "Si las cartas coinciden, permanecen visibles; si no, se ocultan.",
        "El objetivo es despejar todo el tablero.",
        "A menor tiempo y menos intentos, mayor será tu puntuación final."
      ]
    },
    {
      id: "trivia",
      title: "Trivia Pro",
      description: "Demuestra cuánto sabes de tu carrera y tecnología.",
      icon: <Brain className="text-blue-500" size={32} />,
      color: "from-blue-500/20 to-blue-500/5",
      path: "/games/trivia",
      difficulty: "Medio",
      howToPlay: [
        "Responde preguntas de opción múltiple antes de que el tiempo se agote.",
        "La velocidad cuenta: responder rápido multiplica tus puntos.",
        "Cuidado: las preguntas se vuelven más difíciles conforme avanzas.",
        "Si fallas demasiadas preguntas, pierdes la partida.",
        "Incluye secciones especiales con temas de tu propia carrera."
      ]
    },
    {
      id: "michi",
      title: "Michi (Tic-Tac-Toe)",
      description: "Reta a la IA o a un amigo en el clásico duelo.",
      icon: <Hash className="text-purple-500" size={32} />,
      color: "from-purple-500/20 to-purple-500/5",
      path: "/games/michi",
      difficulty: "Fácil",
      howToPlay: [
        "Elige jugar contra 'Yawas AI' o contra un compañero localmente.",
        "Marca una casilla por turno (X o O).",
        "Gana el primero en formar una línea vertical, horizontal o diagonal.",
        "Si se llenan todas las casillas sin un ganador, se declara empate."
      ]
    },
    {
      id: "wordle",
      title: "Palabra Diaria",
      description: "Adivina la palabra del día relacionada al campus.",
      icon: <Type className="text-orange-500" size={32} />,
      color: "from-orange-500/20 to-orange-500/5",
      path: "/games/wordle",
      difficulty: "Difícil",
      howToPlay: [
        "Adivina una palabra de 5 letras relacionada a la vida estudiantil.",
        "Tienes 6 intentos. Los colores te darán pistas sobre las letras.",
        "Verde: Letra correcta en el lugar correcto.",
        "Amarillo: La letra está en la palabra, pero en otra posición.",
        "Gris: La letra no forma parte de la palabra."
      ]
    },
    {
      id: "caza-talentos",
      title: "Caza Talentos",
      description: "Muestra tu destreza con los reflejos.",
      icon: <Target className="text-amber-500" size={32} />,
      color: "from-amber-500/20 to-amber-500/5",
      path: "/games/caza-talentos",
      difficulty: "Fácil",
      howToPlay: [
        "Haz clic o toca los 'talentos' que aparecen rápidamente en pantalla.",
        "Cada talento capturado suma 10 puntos a tu marcador.",
        "¡Cuidado! Si tocas una bomba, perderás 50 puntos de golpe.",
        "Atrapa los iconos de reloj para ganar 5 segundos extra de juego.",
        "Consigue la mayor puntuación antes de que el cronómetro llegue a cero."
      ]
    },
    {
      id: "busca-minas",
      title: "Busca Minas",
      description: "Evita toparte con los exámenes sorpresa.",
      icon: <Bomb className="text-cyan-500" size={32} />,
      color: "from-cyan-500/20 to-cyan-500/5",
      path: "/games/busca-minas",
      difficulty: "Medio",
      howToPlay: [
        "Despeja el tablero sin detonar los 'Exámenes Sorpresa' (minas).",
        "Usa los números como pistas para saber cuántos exámenes hay cerca.",
        "Coloca banderas en las casillas donde sospeches que hay un examen.",
        "Ganas si logras revelar todas las casillas seguras del campus."
      ]
    },
    {
      id: "codigo-matricula",
      title: "Código Matrícula",
      description: "Hackea el sistema para conseguir el mejor horario.",
      icon: <CombineIcon className="text-fuchsia-500" size={32} />,
      color: "from-fuchsia-500/20 to-fuchsia-500/5",
      path: "/games/codigo-matricula",
      difficulty: "Medio",
      howToPlay: [
        "Ordena las secuencias de código para desbloquear tu matrícula.",
        "Cada secuencia correcta te otorga 10 puntos.",
        "Evita los errores: un fallo crítico te restará 50 puntos.",
        "Debes ser rápido; el servidor de matrículas se cae cuando el tiempo acaba.",
        "Usa los 'bonus de red' para ganar puntos extra de hackeo."
      ]
    },
    {
      id: "red-connection",
      title: "Conexión de Redes",
      description: "Conecta las redes sin cruzar las líneas.",
      icon: <Container className="text-lime-500" size={32} />,
      color: "from-lime-500/20 to-lime-500/5",
      path: "/games/red-connection",
      difficulty: "Difícil",
      howToPlay: [
        "Dibuja líneas para conectar nodos del mismo color.",
        "Las líneas no pueden cruzarse entre sí ni tocar otros nodos.",
        "Debes llenar todos los espacios vacíos del tablero para completar el nivel.",
        "Cada conexión exitosa suma puntos según la longitud de la línea."
      ]
    }
  ];