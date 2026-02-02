import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
//import App from "./App.jsx";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FollowProvider } from "./context/FollowContext.jsx";
import { AuthModalProvider } from "./context/AuthModalContext.jsx";
import AuthModal from "./components/ui/AuthModal .jsx";
import { AudioProvider } from "./context/AudioContext.jsx";
import App from "./Appv2.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Los datos se consideran "frescos" por 5 minutos
      cacheTime: 1000 * 60 * 30, // Se mantienen en memoria 30 minutos
      refetchOnWindowFocus: false, // No recargar cada vez que el usuario vuelve a la pestaña
    },
  },
});

createRoot(document.getElementById("root")).render(
  <AuthModalProvider>
    <AuthContextProvider>
      <FollowProvider>
        <QueryClientProvider client={queryClient}>
          <AuthModal />
          <AudioProvider>
            <App />
          </AudioProvider>
        </QueryClientProvider>
      </FollowProvider>
    </AuthContextProvider>
  </AuthModalProvider>,
);
