# Refactorización del Componente TriviaGamev3

## 📋 Descripción

Se ha realizado una refactorización completa del componente `TriviaGamev3.jsx` separando la lógica del negocio de la presentación, aplicando mejores prácticas de React y optimizaciones de rendimiento.

## 🏗️ Estructura Nueva

### 1. **Hook Personalizado: `useTriviaGame`**
**Ubicación:** `src/hooks/triviav2/useTriviaGame.js`

Centraliza toda la lógica del juego:
- **Gestión de estados:** preguntas, puntuación, tiempo, etc.
- **Efectos optimizados:** useEffect para diferentes ciclos
- **Funciones memoizadas:** useCallback para evitar renders innecesarios
- **Cálculos memoizados:** useMemo para datos derivados

**Ventajas:**
- Lógica reutilizable en otros componentes
- Más fácil de testear
- Mejor rendimiento con dependencies bien definidas

### 2. **Componentes UI: `TriviaComponents.jsx`**
**Ubicación:** `src/components/games/trivia/TriviaComponents.jsx`

Componentes presentacionales pequeños y enfocados:

#### `GameHeader`
- Muestra categoría e icono
- Chip de dificultad con estilos dinámicos
- Memoizado para evitar re-renders

#### `GameProgressBar`
- Barra de progreso animada
- Temporizador con cambio de color dinámico
- Información de la pregunta actual

#### `ScoreDisplay`
- Puntos totales con animación
- Indicador de racha (combo)
- Solo se renderiza cuando hay cambios

#### `QuestionCard`
- Pregunta con marca de agua de dificultad
- Aislado para animations

#### `AnswerOptions`
- Botones de respuesta con estados dinámicos
- Estilos condicionales para correcto/incorrecto
- Animaciones con Framer Motion
- Memoizado para optimización

#### `FloatingPoints`
- Animación de puntos ganados
- Badge de boost de carrera
- Solo visible cuando es necesario

### 3. **Pantallas: `TriviaScreens.jsx`**
**Ubicación:** `src/components/games/trivia/TriviaScreens.jsx`

Componentes para diferentes estados del juego:

#### `LoadingScreen`
- Spinner animado
- Mensaje de carga

#### `CountdownScreen`
- Cuenta regresiva 3-2-1
- Animaciones escaladas
- Círculos decorativos de fondo

#### `FinishedScreen`
- Integración con `ResultsView`
- Muestra puntos y precisión

#### `ErrorScreen`
- Pantalla de error
- Botón de reintentar

### 4. **Componente Principal: `TriviaGamev3.jsx`**
**Ubicación:** `src/pages/games/TriviaGamev3.jsx`

Ahora es un componente presentacional que:
- Solo renderiza la UI
- Usa el hook `useTriviaGame` para la lógica
- Maneja rutas de estados (loading, playing, finished, etc.)
- Memoizado para optimización

## 🚀 Optimizaciones Implementadas

### 1. **useCallback**
```javascript
const onSelectAnswer = useCallback((index) => {
  handleAnswer(index);
}, [handleAnswer]);
```
- Evita crear funciones nuevas en cada render
- Previene re-renders innecesarios de componentes hijos

### 2. **useMemo**
```javascript
const currentQuestion = useMemo(
  () => questions[currentIndex],
  [questions, currentIndex]
);
```
- Cachea valores derivados
- Solo recalcula cuando sus dependencias cambian

### 3. **memo (React.memo)**
```javascript
const GameHeader = memo(({ activeCategory, difficulty }) => { ... })
```
- Evita re-renders si los props no cambian
- Beneficio especial en listas y componentes frecuentes

### 4. **Separación de concerns**
- Lógica en hooks personalizado
- UI en componentes presentacionales
- Constantes fuera del componente
- Mejor testing y mantenimiento

### 5. **Effect Dependencies**
- Cada effect tiene dependencias claras
- Evita loops infinitos
- Limpia timers y listeners

### 6. **Constantes extractadas**
```javascript
const DIFFICULTY_SETTINGS = { ... }
const INITIAL_COUNTDOWN = 3
const ANSWER_FEEDBACK_DELAY = 1500
```
- Facilita mantenimiento
- Evita magic numbers

## 📊 Comparativa Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Líneas en componente** | 524 | 174 |
| **Complejidad ciclomática** | Alto | Bajo |
| **Reutilización de lógica** | No | Sí (hook) |
| **Testing** | Difícil | Fácil |
| **Performance** | Regular | Optimizado |
| **Mantenibilidad** | Media | Alta |

## 🔄 Flujo de Datos

```
TriviaGamev3.jsx (Presentación)
    ↓
useTriviaGame.js (Lógica)
    ├── Estados
    ├── Effects
    ├── Callbacks (memoizados)
    └── Memos
    ↓
TriviaComponents.jsx (Componentes UI)
    ├── GameHeader
    ├── GameProgressBar
    ├── ScoreDisplay
    ├── QuestionCard
    ├── AnswerOptions
    └── FloatingPoints
    ↓
TriviaScreens.jsx (Pantallas completas)
    ├── LoadingScreen
    ├── CountdownScreen
    ├── FinishedScreen
    └── ErrorScreen
```

## 💾 Funcionalidad Preservada

✅ Todas las características originales se mantienen:
- Carga de preguntas aleatorias
- Temporizador por pregunta
- Cálculo de puntos con bonos
- Sistema de racha (combo)
- Boost de carrera
- Animaciones fluidas
- Guardado de resultados
- Reset del juego

## 🛠️ Cómo Usar el Hook en Otros Componentes

```javascript
import { useTriviaGame } from "../../hooks/triviav2/useTriviaGame";

function MyComponent() {
  const { points, score, handleAnswer, handleReset } = useTriviaGame(profile);
  
  // Usar la lógica como necesites
}
```

## 📝 Notas Importantes

1. **Dependencies en Effects:** Verificar que todas las dependencias estén correctas
2. **Timer Cleanup:** Los timers se limpian correctamente en los returns de useEffect
3. **Memory Leaks:** Se han eliminado potenciales memory leaks
4. **Performance:** El componente ahora re-renderiza solo cuando es necesario

## 🔍 Próximas Mejoras (Opcionales)

- [ ] Agregar context para compartir datos globales
- [ ] Implementar lazy loading de componentes
- [ ] Agregar error boundary
- [ ] Tests unitarios con Jest/React Testing Library
- [ ] Performance profiling con React DevTools
- [ ] Persistencia local del estado
