import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";

// Opción oscura (estilo GitHub Dark)
import "highlight.js/styles/atom-one-dark.css";
// O prueba esta si la anterior falla:
//import 'highlight.js/styles/base16/dracula.css';

// Opción clara (si tu blog es mayormente blanco)
// import 'highlight.js/styles/github.css';

// Opción colorida (Monokai)
//import 'highlight.js/styles/monokai-sublime.css';

// Contextos y Layouts (Importación directa para carga inmediata)

import { SearchProvider } from "./context/SearchContext";
import HomeLayout from "./components/layout/HomeLayout";
import ProtectedRoute from "./components/utils/ProtectedRoute";

// Páginas Principales (Carga inmediata para mejor LCP)
import Feed from "./components/pages/Feed";
import Login from "./components/pages/Login";
import BlogFeed from "./pages/blog/BlogFeed";
import CreateBlog from "./pages/blog/CreateBlog5";
import BlogDetail from "./pages/blog/BlogDetailv5";
import { ModalProvider } from "./context/ModalContextv3";
import MyBlogs from "./pages/user-blog/MyBlogs";

// --- IMPORTS DINÁMICOS (Lazy Loading) ---
const CreatePost = lazy(() => import("./components/pages/CreatePost"));
const SearchPage = lazy(() => import("./components/pages/SearchPage"));
const UserProfile = lazy(() => import("./components/pages/UserProfile"));
const EditProfile = lazy(() => import("./components/pages/EditProfile"));
const SavedPage = lazy(() => import("./components/pages/SavedPage"));
const DiscoverPage = lazy(() => import("./components/pages/DiscoverPage"));
const PostPage = lazy(() => import("./components/pages/PostPage"));
const CommentThreadPage = lazy(
  () => import("./components/pages/CommentThreadPage"),
);
const NotificationsPage = lazy(
  () => import("./components/pages/NotificationsPage"),
);
const UserConnections = lazy(
  () => import("./components/pages/UserConnections2"),
);
const CampusAI = lazy(() => import("./pages/chat/CampusAI2"));

// Juegos (Separarlos es vital porque suelen tener mucha lógica)
const GameCenter = lazy(() => import("./pages/games/GameCenter"));
const TriviaGame = lazy(() => import("./pages/games/TriviaGame"));
const WordleGame = lazy(() => import("./pages/games/WordleGame"));
const ConectorRedes = lazy(() => import("./pages/games/ConectorRedes"));
const MemoryGame = lazy(() => import("./components/games/MemoryGamev2"));
const MichiGame = lazy(() => import("./pages/games/MichiGamev2"));
const CazaTalentos = lazy(() => import("./pages/games/CazaTalentosv2"));
const BuscaMinas = lazy(() => import("./pages/games/BuscaMinasv2"));
const CodigoMatricula = lazy(() => import("./pages/games/CodigoMatricula3"));
const Leaderboard = lazy(() => import("./pages/games/LeaderBoard4"));
const YoMACStore = lazy(() => import("./pages/games/YOMACStorev2"));

// Un Loading Spinner Premium para las transiciones
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-black">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
  </div>
);

function App() {
  // Desbloqueo de Audio optimizado con una sola ejecución
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
    return () => document.removeEventListener("click", unlockAudio);
  }, []);

  return (
    <BrowserRouter>
      <SearchProvider>
        <ModalProvider>
          <Toaster
            richColors
            position="top-center"
            //toastOptions={{ duration: 4000 }}
            duration={3000}
            expand
          />
          {/* Suspense atrapa las rutas cargadas perezosamente */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="login" element={<Login />} />

              <Route path="/" element={<HomeLayout />}>
                <Route index element={<Feed />} />
                <Route path="games" element={<GameCenter />} />
                <Route path="games/leaderboard" element={<Leaderboard />} />

                {/* Rutas Protegidas */}
                <Route element={<ProtectedRoute />}>
                  <Route path="create-post" element={<CreatePost />} />
                  <Route
                    path="user/:userId/connections"
                    element={<UserConnections />}
                  />
                  <Route path="editProfile" element={<EditProfile />} />
                  <Route path="savedPost" element={<SavedPage />} />
                  <Route path="yawas" element={<CampusAI />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route
                    path="comment/:commentId"
                    element={<CommentThreadPage />}
                  />

                  {/* Sub-Rutas de Juegos */}
                  <Route path="games">
                    <Route path="memory" element={<MemoryGame />} />
                    <Route path="trivia" element={<TriviaGame />} />
                    <Route path="michi" element={<MichiGame />} />
                    <Route path="wordle" element={<WordleGame />} />
                    <Route path="caza-talentos" element={<CazaTalentos />} />
                    <Route path="busca-minas" element={<BuscaMinas />} />
                    <Route
                      path="codigo-matricula"
                      element={<CodigoMatricula />}
                    />
                    <Route path="red-connection" element={<ConectorRedes />} />
                    
                    <Route path="store" element={<YoMACStore />} />
                  </Route>

                  <Route path="blog/create" element={<CreateBlog />} />
                  <Route path="blog/edit/:id" element={<CreateBlog isEditing={true} />} />
                  <Route path="blog/:slug" element={<BlogDetail />} />
                  <Route path="blog/my-blogs" element={<MyBlogs />} />
                </Route>

                {/* Rutas Públicas dentro del Layout */}
                <Route path="search" element={<SearchPage />} />
                <Route path="profile/:userId" element={<UserProfile />} />
                <Route path="users" element={<DiscoverPage />} />
                <Route path="post/:postId" element={<PostPage />} />
                <Route path="blog" element={<BlogFeed />} />
                
              </Route>
            </Routes>
          </Suspense>
        </ModalProvider>
      </SearchProvider>
    </BrowserRouter>
  );
}

export default App;
