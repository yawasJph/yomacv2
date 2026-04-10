import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";

// Opción oscura (estilo GitHub Dark)
import "highlight.js/styles/atom-one-dark.css";
// O prueba esta si la anterior falla:
//import 'highlight.js/styles/base16/dracula.css';

// Opción clara (si tu blog es mayormente blanco)
//import 'highlight.js/styles/github.css';

// Opción colorida (Monokai)
//import 'highlight.js/styles/monokai-sublime.css';

// Contextos y Layouts (Importación directa para carga inmediata)

// Páginas Principales (Carga inmediata para mejor LCP)
import Feed from "./components/pages/Feed";
import Login from "./components/pages/Login";
import { ModalProvider } from "./context/ModalContextv3";
import AdminRoute from "./routes/AdminRoute";
import { SearchProvider } from "./context/SearchContext";
import HomeLayout from "./components/layout/HomeLayout";
import ProtectedRoute from "./components/utils/ProtectedRoute";

// --- IMPORTS DINÁMICOS (Lazy Loading) ---

// Messages (Lazy Loading)
const MessagesPage = lazy(() => import("./pages/messages/MessagesPagev2"));

// Blog (Lazy Loading)
const BlogFeed = lazy(() => import("./pages/blog/BlogFeedv2"));
const BlogDetail = lazy(() => import("./pages/blog/BlogDetailv6"));
const MyBlogs = lazy(() => import("./pages/user-blog/MyBlogs2"));
const CreateBlog = lazy(() => import("./pages/blog/CreateBlog6"));

// Admin (Lazy Loading)
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminUsersManager = lazy(() => import("./pages/admin/AdminUsersManager"));
const AdminBugReports = lazy(() => import("./pages/admin/AdminBugReports"));
const AdminTrashCleanup = lazy(() => import("./pages/admin/AdminTrashCleanup"));

// TYC (Lazy Loading)
const TermsOfService = lazy(() => import("./pages/t&c/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/t&c/PrivacyPolicy"));

// Settings (Lazy Loading)
const ReportBug = lazy(() => import("./pages/settings/ReportBug"));
const AboutYoMAC = lazy(() => import("./pages/settings/AboutYoMAC"));
const NotificationSettings = lazy(
  () => import("./pages/settings/NotificationSettings"),
);
const SettingsLayout = lazy(() => import("./pages/settings/SettingsLayout"));
const AccountSettings = lazy(() => import("./pages/settings/AccountSettings"));
const DisplaySettings = lazy(() => import("./pages/settings/DisplaySettings"));

// Social (Lazy Loading) ---
const CreatePost = lazy(() => import("./components/pages/CreatePost"));
const SearchPage = lazy(() => import("./components/pages/SearchPage"));
const UserProfile = lazy(() => import("./components/pages/UserProfilev2"));
const EditProfile = lazy(() => import("./components/pages/EditProfilev2"));
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

// Yawas (Lazy Loading)
const CampusAI = lazy(() => import("./pages/chat/CampusAI2"));

// Juegos (Lazy Loading)
const GameCenter = lazy(() => import("./pages/games/GameCenter"));
const TriviaGame = lazy(() => import("./pages/games/TriviaGame"));
const WordleGame = lazy(() => import("./pages/games/WordleGame2"));
const ConectorRedes = lazy(() => import("./pages/games/ConectorRedes"));
const MemoryGame = lazy(() => import("./components/games/MemoryGamev2"));
const MichiGame = lazy(() => import("./pages/games/MichiGamev2"));
const CazaTalentos = lazy(() => import("./pages/games/CazaTalentosv3"));
const BuscaMinas = lazy(() => import("./pages/games/BuscaMinasv3"));
const CodigoMatricula = lazy(() => import("./pages/games/CodigoMatricula4"));
const Leaderboard = lazy(() => import("./pages/games/LeaderBoard4"));
const YoMACStore = lazy(() => import("./pages/games/YOMACStorev2"));

// notFound (Lazy Loading)
const NotFound = lazy(() => import("./pages/NotFound")); // O la ruta donde lo crees

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
              {/* Auth rute - Public*/}
              <Route path="login" element={<Login />} />

              {/* TYC rute - Public*/}
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />

              {/* Root rute - Public*/}
              <Route path="/" element={<HomeLayout />}>
                <Route index element={<Feed />} />

                <Route path="games" element={<GameCenter />} />
                <Route path="games/leaderboard" element={<Leaderboard />} />

                {/* Rutas Protegidas */}
                <Route element={<ProtectedRoute />}>
                  {/* Social rute - Private*/}
                  <Route path="create-post" element={<CreatePost />} />
                  <Route
                    path="user/:userId/connections"
                    element={<UserConnections />}
                  />
                  <Route path="editProfile" element={<EditProfile />} />
                  <Route path="savedPost" element={<SavedPage />} />

                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route
                    path="comment/:commentId"
                    element={<CommentThreadPage />}
                  />

                  {/* Yawas rute - Private*/}
                  <Route path="yawas" element={<CampusAI />} />

                  {/* Sub-Rutas de Juegos - Private*/}
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

                  {/* Blog route - Private*/}
                  <Route path="blog/create" element={<CreateBlog />} />
                  <Route
                    path="blog/edit/:id"
                    element={<CreateBlog isEditing={true} />}
                  />
                  <Route path="blog/my-blogs" element={<MyBlogs />} />

                  {/* Messages route - Private */}
                  <Route path="messages" element={<MessagesPage />} />

                  {/* Settings route - Private*/}
                  <Route path="settings" element={<SettingsLayout />}>
                    <Route index element={<Navigate to="account" replace />} />
                    <Route path="account" element={<AccountSettings />} />
                    <Route path="display" element={<DisplaySettings />} />
                    <Route path="report" element={<ReportBug />} />
                    <Route path="about" element={<AboutYoMAC />} />
                    <Route
                      path="notifications"
                      element={<NotificationSettings />}
                    />
                  </Route>
                </Route>

                {/* Rutas de Admin Protegidas */}
                <Route element={<AdminRoute />}>
                  <Route path="admin">
                    <Route path="dashboard" element={<AdminOverview />} />
                    <Route
                      path="dashboard/users"
                      element={<AdminUsersManager />}
                    />
                    <Route
                      path="dashboard/bugs"
                      element={<AdminBugReports />}
                    />
                    <Route
                      path="dashboard/cleanup"
                      element={<AdminTrashCleanup />}
                    />
                  </Route>
                </Route>

                {/* Rutas Públicas dentro del Layout */}
                <Route path="search" element={<SearchPage />} />
                {/* <Route path="profile/:userId" element={<UserProfile />} /> */}
                <Route path="profile/:username" element={<UserProfile />} />
                <Route path="users" element={<DiscoverPage />} />
                <Route path="post/:postId" element={<PostPage />} />
                <Route path="blog" element={<BlogFeed />} />
                <Route path="blog/:slug" element={<BlogDetail />} />
                {/* EL GUARDIÁN DEL FINAL (Ruta 404) */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ModalProvider>
      </SearchProvider>
    </BrowserRouter>
  );
}

export default App;
