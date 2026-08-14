# PLAN DE MEJORA — YoMAC v2

## Estado base (punto de partida)
- SPA: Vite 7 + React 19 + Tailwind 4 + Supabase + TanStack Query + react-router 7
- Entry único: `main.jsx → Appv2.jsx`
- ✅ Lint 0 errores (115 warnings) · ✅ Build OK · ✅ 809 imports sin roturas
- Working tree: 209 borrados + 67 modificados + 4 renames (SIN commitear — se mantendrá así por decisión del usuario)

## FASE A — Sellar base y eliminar código muerto
**Objetivo:** deuda trivial, bajo riesgo, sin cambios de comportamiento.
- A1. Borrar componentes muertos verificados:
  - `src/components/games/ResultsView.jsx`
  - `src/components/games/trivia/ResultViewv2.jsx`
  - `src/components/ui/UserSearchCard.jsx`
  - `src/components/utils/timeagoTiny.js` y `timeAgoLong.js`
  - `src/components/tiptap-ui-primitive/spacer/` (spacer.jsx + index.jsx)
  - `src/components/tiptap-ui-primitive/toolbar/toolbar.jsx` + `index.jsx` (v1; vivo es toolbarv2.jsx)
  - `src/components/tiptap-templates/simple/data/content-default.json` + `content-spanish.json`
  - `src/components/ui/userProfile/DevBadge.jsx` (uso comentado) → decidir: borrar o revivir
- A2. Borrar carpetas vacías: `tiptap-extension/`, `ui/animated/`, `ui/cardResult/`, `pages/store/`, `function/`, `og/`, `ogData/`, `service/`
- A3. Naming: renombrar `src/components/ui/rigthSidebar/` → `rightSidebar` (migrar imports en `RigthSidebar.jsx`, `TrendingTopics.jsx`, `UserSuggestions2.jsx`); `UserSearchCardSkleton.jsx` → `UserSearchCardSkeleton.jsx`; `consts/blog/errorMesages.js` → `errorMessages.js`; `consts/notFound/noFoundPost.js` → `notFoundPost.js`
- A4. Verificar con `npx eslint .` + `npm run build` tras cada bloque.

## FASE B — Consolidar data-layer (colisiones de caché y huérfanos)
**Objetivo:** corregir bugs latentes de React Query (keys duplicadas) y eliminar duplicados.
- B1. **`useNotifications` (root) vs `useNotificationsv2` (notification/)**: ambas usan key `["notifications", user?.id]` y canales Realtime; `NotificationIcon` usa root y `NotificationsPage` usa v2. Unificar en una sola, migrar `NotificationIcon.jsx`, borrar la otra.
- B2. **`useProfile` (hooks/, por id) vs `useProfilev2` (hooks/user/, por username)**: misma key base `["profile", …]`. Unificar a una sola API (por id) o diferenciar keys (`profile-by-id` / `profile-by-username`). Migrar consumidores.
- B3. Borrar hooks huérfanos (solo referencias comentadas): `src/hooks/useChat.js`, `src/hooks/yawas/useYawasChat.js`, `src/hooks/usePostsInfiniteQuery2.js`, `src/hooks/admin/useBanUser.JS`.
- B4. Unificar sistema de tema: migrar `useDarkMode.js` (consumidores: `EmojiSelector`, `EmojiSelectorv2`) bajo `ThemeContext`; verificar que `localStorage["darkMode"]` y `["theme"]` converjan.

## FASE C — Warnings de hooks (riesgo de bugs)
**Objetivo:** eliminar los warnings que indican bugs potenciales.
- C1. `react-hooks/exhaustive-deps` (31): prioridad en `pages/games/*`, `hooks/messages/useChatv4.js`, `hooks/memorama/useMemoryGame.js`, `hooks/yawas/*`.
- C2. `react-hooks/set-state-in-effect` (17): revisar sync de estado; reemplazar por derived state donde aplique.
- C3. `react-hooks/purity`, `refs`, `preserve-manual-memoization`, `immutability` (24): corregir legítimos, mantener warn los falsos positivos del plugin experimental.
- C4. `react-refresh/only-export-components` (43): separar helpers de componentes en barrels de tiptap, o bajar a off si el coste no justifica.
- C5. Falsos positivos del plugin experimental → warn con comentario justificativo.

## FASE D — Performance
**Objetivo:** reducir tamaño de bundle y re-renders.
- D1. **Code splitting de TipTap**: sacar el ecosistema `@tiptap/*` del chunk principal.
- D2. **CampusAI2 (1.7MB chunk)**: separar UI del chat de librerías pesadas; lazy-load si se usan client-side.
- D3. Analizar mapa de chunks y ajustar `manualChunks` / `chunkSizeWarningLimit`.
- D4. Memoización: `CardPost`/`Feed`, `CommentItem`.
- D5. Verificar deps client sin uso en `src`: `@mercadopago/sdk-react`, `@google/*`, `openai`, `prismjs`, `react-hotkeys-hook`, `@floating-ui/react`.

## FASE E — Robustez y QA (opcional / futura)
- E1. Testing: Vitest + React Testing Library (hooks de datos y componentes core).
- E2. Auditoría Supabase: RLS policies, edge functions referenciadas.
- E3. Accesibilidad/SEO: meta tags en `index.html`, contraste/ARIA.
- E4. Documentar warnings finales en `npm run lint`.

## Criterios de aceptación por fase
- Cada fase termina con `npx eslint .` sin nuevos errores y `npm run build` exitoso.
- Fase B y C además sin cambios de comportamiento visible.
- Registro del progreso al final de este archivo.

## Orden de ejecución
A → B → C → D → E (cada fase se cierra con lint+build antes de pasar a la siguiente).

---

## Progreso

| Fase | Estado |
|---|---|
| A — Sellar base y código muerto | ✅ Completada (lint 0 err / 107 warn, build OK) |
| B — Consolidar data-layer | ✅ Completada (unificó useNotifications, diferenció keys de profile, eliminó 4 hooks huérfanos, consolidó tema; 0 err / 104 warn, build OK) |
| C — Warnings de hooks | ✅ Completada (0 errores / **0 warnings** en lint, build OK) |
| D — Performance | ✅ Completada (chunks: tiptap 431 kB separados, emoji 270 kB, index 707 kB + CampusAI2 1.7 MB; lint 0 err / 0 warn, build OK) |
| E — Robustez y QA | ⏳ En progreso |
