import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import HomeLayout from "./components/layout/HomeLayout";
import Feed from "./components/pages/Feed";

function App() {
  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLayout/>}>
          <Route index element={<Feed/>} />
        </Route>
      </Routes>
   </BrowserRouter>
  );
}

export default App;
