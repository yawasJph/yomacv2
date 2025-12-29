import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import HomeLayout from "./components/layout/HomeLayout";
import Feed from "./components/pages/Feed";
import Login from "./components/pages/Login";
import CreatePost from "./components/pages/CreatePost";
import ProtectedRoute from "./components/utils/ProtectedRoute";
import { Toaster } from "sonner";
import SearchPage from "./components/pages/SearchPage";
import UserConnections from "./components/pages/UserConnections";
import UserProfile from "./components/pages/UserProfile";
import EditProfile from "./components/pages/EditProfile";
import SavedPage from "./components/pages/SavedPage";
import DiscoverPage from "./components/pages/DiscoverPage";
import PostPage from "./components/pages/PostPage";

function App() {

  return (
   <BrowserRouter>
    <Toaster 
      // 🔄 Opción para que los colores de error y éxito sean más vivos
      richColors 
        
   />
      <Routes>
        <Route path="login" element={<Login/>} />
        <Route path="/" element={<HomeLayout/>}>
          <Route index element={<Feed/>} />
          <Route path="create-post" element={<ProtectedRoute><CreatePost/></ProtectedRoute>} />
          <Route path="search" element={<ProtectedRoute><SearchPage/></ProtectedRoute> } />
          <Route path="user/:userId/connections" element={<ProtectedRoute><UserConnections/></ProtectedRoute>}/>
          <Route path="profile/:userId" element={<ProtectedRoute><UserProfile/></ProtectedRoute>}/>
          <Route path="editProfile" element={<ProtectedRoute><EditProfile/></ProtectedRoute>}/>
          <Route path="savedPost" element={<ProtectedRoute><SavedPage/></ProtectedRoute>}/>
          <Route path="users" element={<ProtectedRoute><DiscoverPage/></ProtectedRoute>}/>
          <Route path="post/:postId" element={<ProtectedRoute><PostPage/></ProtectedRoute>}/>
        </Route>
        
        
      </Routes>
     
   </BrowserRouter>
   
  );
}

export default App;
