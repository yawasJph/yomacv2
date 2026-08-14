import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Esta es la forma más rápida y moderna para Vercel
    esbuild: {
      drop: ['console', 'debugger'],
    },
    // Separar dependencias pesadas en chunks manuales
    rollupOptions: {
      output: {
        manualChunks: {
          tiptap: ["@tiptap/react", "@tiptap/starter-kit", "@tiptap/extension-image", "@tiptap/extension-list", "@tiptap/extension-text-align", "@tiptap/extension-typography", "@tiptap/extension-highlight", "@tiptap/extension-subscript", "@tiptap/extension-superscript", "@tiptap/extensions", "@tiptap/extension-code-block-lowlight"],
          emoji: ["emoji-picker-react"],
        },
      },
      // Aumentar límite de warning de chunk a 1MB (los chunks de juegos y CampusAI2 son esperados)
      chunkSizeWarningLimit: 1024 * 1024,
    },
  },
});
