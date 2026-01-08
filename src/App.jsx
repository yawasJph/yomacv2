import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import HomeLayout from "./components/layout/HomeLayout";
import Feed from "./components/pages/Feed";
import Login from "./components/pages/Login";
import CreatePost from "./components/pages/CreatePost";
import ProtectedRoute from "./components/utils/ProtectedRoute";
import { Toaster } from "sonner";
import SearchPage from "./components/pages/SearchPage";
//import UserConnections from "./components/pages/UserConnections";
import UserProfile from "./components/pages/UserProfile";
import EditProfile from "./components/pages/EditProfile";
import SavedPage from "./components/pages/SavedPage";
import DiscoverPage from "./components/pages/DiscoverPage";
import PostPage from "./components/pages/PostPage";
import CommentThreadPage from "./components/pages/CommentThreadPage";
import NotificationsPage from "./components/pages/NotificationsPage";
import { useEffect } from "react";
import PushSettings from "./components/pages/PushSettings";
import UserConnections from "./components/pages/UserConnections2";
import GameCenter from "./pages/games/GameCenter";
import MemoryGame from "./components/games/MemoryGame";
import Leaderboard from "./pages/games/Leaderboard";
import BadgeStore from "./pages/games/BadgeStore";
import YoMACStore from "./pages/games/YoMACStore";
import RpgHud from "./components/games/RpgHud";

function App() {
  
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then()
        .catch((err) =>
          console.error("Error al registrar el Service Worker", err)
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
      <Toaster
        // 🔄 Opción para que los colores de error y éxito sean más vivos
        richColors
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
          <Route
            path="search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="user/:userId/connections"
            element={
              <ProtectedRoute>
                <UserConnections />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile/:userId"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
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
          <Route
            path="users"
            element={
              <ProtectedRoute>
                <DiscoverPage />
              </ProtectedRoute>
            }
          />
          <Route path="post/:postId" element={<PostPage />} />
          <Route path="comment/:commentId" element={<CommentThreadPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<PushSettings />} />
          <Route path="games" element={<GameCenter />} />
          <Route path="games/memory" element={<MemoryGame />} />
          <Route path="games/leaderboard" element={<Leaderboard />} />
          <Route path="games/store" element={<YoMACStore />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
