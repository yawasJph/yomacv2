/**
 * CONFIGURACIÓN RECOMENDADA PARA LA REFACTORIZACIÓN
 * 
 * Este archivo documenta las mejores prácticas y configuraciones
 * para mantener la calidad del código refactorizado.
 */

// ============================================
// 1. ESLint Rules Recomendadas
// ============================================

module.exports = {
  rules: {
    // React
    "react/prop-types": "warn",
    "react/no-unused-prop-types": "warn",
    "react/prefer-stateless-function": "warn",
    "react/jsx-uses-react": "off", // Para React 17+
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Performance
    "no-anonymous-object": "warn",
    "no-arrow-functions-in-object": "warn",

    // Code Quality
    "prefer-const": "warn",
    "no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "no-console": [
      "warn",
      {
        allow: ["warn", "error"],
      },
    ],
    "eqeqeq": ["warn", "always"],
    "curly": "warn",
    "no-var": "error",
  },
};

// ============================================
// 2. Prettier Configuration
// ============================================

{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "endOfLine": "lf"
}

// ============================================
// 3. Convenciones de Nombres
// ============================================

/*
  ARCHIVOS:
  - Componentes React: PascalCase (TriviaGamev3.jsx)
  - Hooks: camelCase con "use" (useTriviaGame.js)
  - Funciones utilitarias: camelCase (calculatePoints.js)
  - Constantes: UPPER_SNAKE_CASE (DIFFICULTY_SETTINGS)
  - Tipos/Interfaces: PascalCase (IGameState.ts)

  VARIABLES:
  - Componentes: PascalCase
  - Estados: camelCase
  - Constantes: UPPER_SNAKE_CASE
  - Privadas: _camelCase (raramente usado en JS)

  FUNCIONES:
  - Handlers: handleXxx, onXxx
  - Callbacks: xxxCallback
  - Getters: getXxx
  - Booleanos: isXxx, hasXxx, canXxx, shouldXxx
*/

// ============================================
// 4. Estructura de Imports
// ============================================

// Orden recomendado:
// 1. React imports
// 2. Librerías externas
// 3. Contextos
// 4. Hooks propios
// 5. Componentes
// 6. Utilidades
// 7. Estilos

import { memo, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useTriviaGame } from "../../hooks/triviav2/useTriviaGame";
import { GameHeader, ScoreDisplay } from "../../components/games/trivia/TriviaComponents";
import { calculatePoints } from "../../utils/gameUtils";
import styles from "./styles.module.css";

// ============================================
// 5. Patrones de Componentes
// ============================================

// ✅ BUENO: Componente memoizado con displayName
const MyComponent = memo(({ prop1, prop2 }) => {
  return <div>{prop1}</div>;
});

MyComponent.displayName = "MyComponent";

export default MyComponent;

// ❌ MALO: Sin memo, sin displayName
function MyComponent({ prop1, prop2 }) {
  return <div>{prop1}</div>;
}

export default MyComponent;

// ============================================
// 6. Patrones de Hooks
// ============================================

// ✅ BUENO: Dependencies correctas
useEffect(() => {
  // Efecto
}, [specificValue]);

// ❌ MALO: Dependencies faltantes o innecesarias
useEffect(() => {
  // Efecto
}, []); // Pero usa variables externas

// ✅ BUENO: useCallback con dependencias
const handleClick = useCallback((value) => {
  // Manejar click
}, [dependencyList]);

// ❌ MALO: Crear función en cada render
const handleClick = (value) => {
  // Manejar click
};

// ✅ BUENO: useMemo para valores derivados
const derivedValue = useMemo(
  () => expensiveCalculation(dependency),
  [dependency]
);

// ❌ MALO: Recalcular en cada render
const derivedValue = expensiveCalculation(dependency);

// ============================================
// 7. Patrones de Estado
// ============================================

// ✅ BUENO: Estado simple y granular
const [isOpen, setIsOpen] = useState(false);
const [selectedIndex, setSelectedIndex] = useState(0);

// ❌ MALO: Estado anidado complejo
const [state, setState] = useState({
  isOpen: false,
  selectedIndex: 0,
  nested: { deep: { value: 0 } },
});

// ✅ BUENO: useReducer para lógica compleja
const [state, dispatch] = useReducer(reducer, initialState);

dispatch({ type: "ACTION", payload: data });

// ❌ MALO: Muchos setState llamados juntos
setA(a + 1);
setB(b + 1);
setC(c + 1);

// ============================================
// 8. Patrones de Condicionales
// ============================================

// ✅ BUENO: Guard clauses
if (gameState === "loading") {
  return <LoadingScreen />;
}

if (gameState === "error") {
  return <ErrorScreen />;
}

// Resto del código

// ❌ MALO: If-else anidado
if (gameState === "loading") {
  return <LoadingScreen />;
} else {
  if (gameState === "error") {
    return <ErrorScreen />;
  } else {
    // Resto del código
  }
}

// ✅ BUENO: Ternario simple
condition ? <ComponentA /> : <ComponentB />;

// ❌ MALO: Ternario anidado
condition1
  ? condition2
    ? condition3
      ? <ComponentA />
      : <ComponentB />
    : <ComponentC />
  : <ComponentD />;

// ============================================
// 9. Patrones de Props Drilling (Evitar)
// ============================================

// ❌ MALO: Props drilling profundo
<ParentComponent props1={a} props2={b} props3={c}>
  <Child1 props1={a} props2={b} props3={c}>
    <Child2 props1={a} props2={b} props3={c}>
      <Child3 props1={a} props2={b} props3={c} />
    </Child2>
  </Child1>
</ParentComponent>;

// ✅ BUENO: Usar Context o pasar children
<Provider value={{ a, b, c }}>
  <ParentComponent>
    <Child1>
      <Child2>
        <Child3 />
      </Child2>
    </Child1>
  </ParentComponent>
</Provider>;

// ============================================
// 10. Patrones de Error Handling
// ============================================

// ✅ BUENO: Try-catch con logging
try {
  await fetchData();
} catch (error) {
  console.error("Error fetching data:", error);
  toast.error("Fallo al cargar datos");
}

// ✅ BUENO: Error boundary para componentes
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// ❌ MALO: Ignorar errores
try {
  await fetchData();
} catch (error) {
  // Hacer nada
}

// ============================================
// 11. Documentación JSDoc
// ============================================

/**
 * Calcula los puntos ganados en una respuesta
 * @param {boolean} isCorrect - Si la respuesta fue correcta
 * @param {number} timeLeft - Tiempo restante en segundos
 * @param {string} difficulty - Nivel de dificultad (Fácil, Medio, Difícil)
 * @param {number} currentStreak - Racha actual de aciertos
 * @returns {number} Puntos ganados en esta pregunta
 * @example
 * const points = calculatePoints(true, 10, "Medio", 3);
 * // returns 250
 */
function calculatePoints(isCorrect, timeLeft, difficulty, currentStreak) {
  // Implementación
}

/**
 * Hook personalizado para manejar la lógica del juego Trivia
 * @param {Object} profile - Perfil del usuario
 * @param {string} profile.carrera - Carrera del usuario
 * @returns {Object} Estado y funciones del juego
 * @throws {Error} Si no se pueden cargar las preguntas
 */
function useTriviaGame(profile) {
  // Implementación
}

// ============================================
// 12. Testing Patterns
// ============================================

describe("useTriviaGame", () => {
  it("should initialize with correct default state", () => {
    const { result } = renderHook(() => useTriviaGame(mockProfile));

    expect(result.current.gameState).toBe("loading");
    expect(result.current.points).toBe(0);
    expect(result.current.score).toBe(0);
  });

  it("should handle answer and update score", () => {
    const { result } = renderHook(() => useTriviaGame(mockProfile));

    act(() => {
      result.current.handleAnswer(correctIndex);
    });

    expect(result.current.score).toBe(1);
  });
});

// ============================================
// 13. Performance Checklist
// ============================================

/*
  □ Componentes memoizados con React.memo
  □ Callbacks memoizados con useCallback
  □ Valores derivados con useMemo
  □ Dependencies list correcta en effects
  □ No crear objetos/arrays como dependencies
  □ Lazy loading de componentes
  □ Code splitting implementado
  □ Bundles analizados con webpack-bundle-analyzer
  □ DevTools profiler ejecutado
  □ No console.logs en producción
  □ Assets optimizados
  □ Imágenes responsivas
  □ Caché estratégico
*/

// ============================================
// 14. Accesibilidad (A11y)
// ============================================

// ✅ BUENO: Atributos ARIA y semántica
<button
  onClick={handleClick}
  aria-label="Cerrar diálogo"
  aria-expanded={isOpen}
  disabled={isDisabled}
>
  Cerrar
</button>;

// ✅ BUENO: Contraste y tamaño de fuente
<div className="text-lg font-semibold text-gray-900 dark:text-white">
  Pregunta importante
</div>;

// ❌ MALO: Sin atributos ARIA
<div onClick={handleClick}>Cerrar</div>;

// ============================================
// 15. Seguridad
// ============================================

// ✅ BUENO: Validar entrada
function validateUserInput(input) {
  if (!input || typeof input !== "string") {
    throw new Error("Invalid input");
  }
  return input.trim();
}

// ✅ BUENO: Sanitizar HTML
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;

// ❌ MALO: Confiar en entrada sin validar
<div dangerouslySetInnerHTML={{ __html: userInput }} />;

// ============================================
// 16. Git Commits Recomendados
// ============================================

/*
  Formato: <tipo>(<scope>): <descripción>

  Ejemplos válidos:
  - refactor(trivia): separate game logic into custom hook
  - feat(trivia): add useCallback optimization to TriviaGame
  - fix(trivia): prevent timer memory leaks
  - docs(trivia): update refactorization guide
  - test(trivia): add unit tests for useTriviaGame hook

  Tipos:
  - feat: Nueva funcionalidad
  - fix: Bug fix
  - refactor: Refactorización sin cambios funcionales
  - perf: Mejoras de performance
  - docs: Cambios en documentación
  - test: Agregar/modificar tests
  - chore: Cambios en dependencias, configuración, etc.
*/

// ============================================
// 17. Pre-commit Hook (Husky)
// ============================================

/*
  .husky/pre-commit:
  
  #!/usr/bin/env sh
  . "$(dirname -- "$0")/_/husky.sh"

  npm run lint
  npm run format
  npm run type-check
  npm test
*/

// ============================================
// 18. CI/CD Pipeline
// ============================================

/*
  .github/workflows/test.yml:
  
  name: Tests
  on: [push, pull_request]
  
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - uses: actions/setup-node@v2
        - run: npm install
        - run: npm run lint
        - run: npm run test
        - run: npm run build
*/

export default {
  // Exportar configuraciones si es necesario
};
