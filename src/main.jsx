import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FollowProvider } from "./context/FollowContext.jsx";
import { AuthModalProvider } from "./context/AuthModalContext.jsx";
import AuthModal from "./components/ui/AuthModal .jsx";
import { SearchProvider } from "./context/SearchContext.jsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthModalProvider>
      <AuthContextProvider>
        
          <FollowProvider>
            <QueryClientProvider client={queryClient}>
              <AuthModal />
              <App />
            </QueryClientProvider>
          </FollowProvider>
        
      </AuthContextProvider>
    </AuthModalProvider>
  </StrictMode>
);
