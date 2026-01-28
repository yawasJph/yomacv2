import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import HomeLayout from "./components/layout/HomeLayout";
import Feed from "./components/pages/Feed";
import Login from "./components/pages/Login";
import CreatePost from "./components/pages/CreatePost";
import ProtectedRoute from "./components/utils/ProtectedRoute";
import { Toaster } from "sonner";
import SearchPage from "./components/pages/SearchPage";
import UserProfile from "./components/pages/UserProfile";
import EditProfile from "./components/pages/EditProfile";
import SavedPage from "./components/pages/SavedPage";
import DiscoverPage from "./components/pages/DiscoverPage";
import PostPage from "./components/pages/PostPage";
import CommentThreadPage from "./components/pages/CommentThreadPage";
import NotificationsPage from "./components/pages/NotificationsPage";
import { useEffect } from "react";
import UserConnections from "./components/pages/UserConnections2";
import GameCenter from "./pages/games/GameCenter";
import YoMACStore from "./pages/games/YoMACStore";
import { SearchProvider } from "./context/SearchContext";
import TriviaGame from "./pages/games/TriviaGame";
//import MichiGame from "./pages/games/MichiGame";
import Leaderboard from "./pages/games/Leaderboard3";
import WordleGame from "./pages/games/WordleGame";
import CazaTalentos from "./pages/games/CazaTalentos";
import BuscaMinas from "./pages/games/BuscaMinas";
import CodigoMatricula from "./pages/games/CodigoMatricula2";
import ConectorRedes from "./pages/games/ConectorRedes";
import CampusAI from "./pages/chat/CampusAI2";
import MemoryGame from "./components/games/MemoryGamev2";
import MichiGame from "./pages/games/MichiGamev2";

function App() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then()
        .catch((err) =>
          console.error("Error al registrar el Service Worker", err),
        );
    });
  }
  // Opcional: En tu App.jsx
  useEffect(() => {
    const unlockAudio = () => {
      const audio = new Audio("/sounds/notification.mp3");
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {});

      document.removeEventListener("click", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
  }, []);

  return (
    <BrowserRouter>
      <SearchProvider>
        <Toaster
          // 🔄 Opción para que los colores de error y éxito sean más vivos
          richColors
          position="top-center"
          toastOptions={{
            duration: 2000,
          }}
        />
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="/" element={<HomeLayout />}>
            <Route index element={<Feed />} />
            <Route
              path="create-post"
              element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              }
            />
            <Route path="search" element={<SearchPage />} />
            <Route
              path="user/:userId/connections"
              element={
                <ProtectedRoute>
                  <UserConnections />
                </ProtectedRoute>
              }
            />
            <Route path="profile/:userId" element={<UserProfile />} />
            <Route
              path="editProfile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="savedPost"
              element={
                <ProtectedRoute>
                  <SavedPage />
                </ProtectedRoute>
              }
            />
            <Route path="yawas" element={<CampusAI />} />
            <Route path="games" element={<GameCenter />} />
            <Route path="games/memory" element={<MemoryGame />} />
            <Route path="games/trivia" element={<TriviaGame />} />
            <Route path="games/michi" element={<MichiGame />} />
            <Route path="games/wordle" element={<WordleGame />} />
            <Route path="games/caza-talentos" element={<CazaTalentos />} />
            <Route path="games/busca-minas" element={<BuscaMinas />} />
            <Route
              path="games/codigo-matricula"
              element={<CodigoMatricula />}
            />
            <Route path="games/red-connection" element={<ConectorRedes />} />
            <Route path="games/leaderboard" element={<Leaderboard />} />
            <Route path="games/store" element={<YoMACStore />} />
            <Route path="users" element={<DiscoverPage />} />
            <Route path="post/:postId" element={<PostPage />} />
            <Route
              path="comment/:commentId"
              element={
                <ProtectedRoute>
                  <CommentThreadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </SearchProvider>
    </BrowserRouter>
  );
}

export default App;
