import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import HomeLayout from "./components/layout/HomeLayout";
import Feed from "./components/pages/Feed";
import Login from "./components/pages/Login";
import CreatePost from "./components/pages/CreatePost";
import ProtectedRoute from "./components/utils/ProtectedRoute";
import { Toaster } from "sonner";
import SearchPage from "./components/pages/SearchPage";
import { useIsMobile } from "./hooks/useIsMobile";
import UserConnections from "./components/pages/UserConnections";
import UserProfile from "./components/pages/UserProfile";

function App() {

  const isMobile = useIsMobile()
  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLayout/>}>
          <Route index element={<Feed/>} />
          <Route path="create-post" element={<ProtectedRoute><CreatePost/></ProtectedRoute>} />
          <Route path="search" element={<ProtectedRoute><SearchPage/></ProtectedRoute> } />
          <Route path="user/:userId/connections" element={<UserConnections/>}/>
          <Route path="profile/:userId" element={<UserProfile/>}/>
        </Route>
        <Route path="login" element={<Login/>} />
        
      </Routes>
      <Toaster 
      // 🔄 Opción para que los colores de error y éxito sean más vivos
      richColors 
        
   />
   </BrowserRouter>
   
  );
}

export default App;
