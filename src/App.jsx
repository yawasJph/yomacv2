import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import HomeLayout from "./components/layout/HomeLayout";
import Feed from "./components/pages/Feed";
import Login from "./components/pages/Login";
import CreatePost from "./components/pages/CreatePost";
import ProtectedRoute from "./components/utils/ProtectedRoute";
import { Toaster } from "sonner";

function App() {
  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLayout/>}>

          <Route index element={<Feed/>} />
          <Route path="create-post" element={<ProtectedRoute><CreatePost/></ProtectedRoute>} />
        </Route>
        <Route path="login" element={<Login/>} />
        
      </Routes>
      <Toaster/>
   </BrowserRouter>
   
  );
}

export default App;
