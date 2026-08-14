# AGENTS.md

YoMAC: red social + centro de juegos gamificado para un instituto peruano. React 19 SPA en Vite, **JavaScript/JSX (no TypeScript)**, Tailwind v4, Supabase remoto, Cloudinary (media), MercadoPago (pagos).

## Comandos

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción (esbuild hace `drop: ['console', 'debugger']`, así que `console.log` NO llega a prod)
- `npm run lint` — `eslint .` (única verificación disponible; **no hay test runner**)

## Arquitectura

- Entrada `src/main.jsx` → `src/Appv2.jsx` (todo el routing está ahí, react-router v7). Guards en `src/routes/`.
- Alias `@/*` → `src/*` (`vite.config.js` + `jsconfig.json`). Úsalo en imports.
- Cliente único: `src/supabase/supabaseClient.js` (supabase-js, env vars).
- Data fetching: TanStack React Query (staleTime 5 min, cacheTime 30 min, sin refetch al enfocar ventana) + hooks en `src/hooks/` + contextos en `src/context/`. Cadena de providers en `main.jsx`.
- `index.html` tiene `class="dark"` fijo: el tema oscuro es el default.

## Supabase (importante)

- Proyecto remoto `vrbfinqvtyclfmvhheub`. **No hay migraciones locales**: `supabase/` solo contiene `.temp/` (gitignored). Todo cambio de schema se hace contra el proyecto remoto vía las herramientas MCP de Supabase (`apply_migration` / `execute_sql`); **no crees archivos de migración locales**.
- El schema usa vistas y funciones; el cliente consulta **vistas**, no tablas (ej. `posts_with_counts`, `comments_with_counts`, `wordle_weekly_ranking`, `generic_weekly_ranking`). Antes de crear una vista/función, verifica que no exista una equivalente.
- Triggers en DB crean perfiles/notificaciones (`handle_new_user`, `create_notification_on_interaction`). No dupliques esa lógica en JS.
- **Deuda de seguridad conocida:** RLS está DESACTIVADO en `games`, `badges`, `user_badges`, `michi_rooms`, `chat_messages`, `payments`. No lo debilites más; si se habilita, hay que crear policies o se rompe el acceso.
- Edge functions (`yawas-chat`, `yawas-chat-v2`, `share-post`, `share-profile`, `share-blog`) están desplegadas directamente en Supabase, **no en este repo**.
- Auth: `src/context/AuthContext.jsx` restringe el login al dominio institucional `@institutomanuelarevalo.drelm.edu.pe` (más el admin hardcodeado `josephllacuashh@gmail.com`) y valida baneos. Cambiar esto = editar ese archivo.

## Env vars

Todas client-side con prefijo `VITE_`, en `.env` (gitignored, **no hay `.env.example`**): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TENOR_API_KEY`, `VITE_CLOUD_NAME`, `VITE_UPLOAD_PRESET`, `VITE_GEMINI_API_KEY`, `VITE_OPENAI_API_KEY`, `VITE_MP_API_KEY`, `VITE_GIPHY_API_KEY`. Las subidas de media van directo a Cloudinary con upload preset unsigned (`VITE_UPLOAD_PRESET`).

## Convenciones y gotchas

- Sin TS ni prop-types (reglas eslint apagadas): los props no están validados.
- Las iteraciones nuevas de una feature conviven como hermanos con sufijo `v2/v3/v4` (ej. `upToCloudinaryv2.js`, `MichiVersusv2.jsx`, `EmojiSelectorv2.jsx`) en vez de reemplazar al viejo. Reutiliza la versión de número más alto; los viejos suelen ser código muerto.
- `react-refresh/only-export-components` está apagado a propósito (archivos de contexto exportan hook + Provider; mezclar components/helpers es válido).
- Catálogo de juegos en `src/components/games/utils/GAMES_LIST.jsx` (define id, título, path). El juego debe existir también en la tabla `games` de la DB.
- Lista de palabras del Wordle en `scripts/` (`allwords.txt`, `filtered_words.json`).
- Tailwind v4 (config en CSS, no hay `tailwind.config.js`). Se usa `@tailwindcss/typography`.
- `src/components/tiptap-*` y los hooks `use-*.js` de utilidad son código vendored de biblioteca, no código de la app.

## Deploy

- Vercel: SPA estático, todas las rutas reescritas a `/` (`vercel.json`). Los enlaces de compartir redirigen a las edge functions de Supabase.