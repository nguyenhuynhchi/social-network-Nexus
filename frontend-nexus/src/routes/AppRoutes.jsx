import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import ScrollToTop from "./ScrollToTop.jsx";
import Login from "../pages/Login.jsx";
import Home from "../pages/Home.jsx";


// import Chat from "../pages/Chat_org.jsx";
import Chat from "../pages/Chat_v2_1.jsx";



import Registration from "../pages/Registration.jsx";

const AppRoutes = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="w-screen h-screen">
        <Routes>

          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/registration" element={<Registration />} />


        </Routes>
      </div>
    </Router>
  );
};

export default AppRoutes;
