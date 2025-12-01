import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import ScrollToTop from "./ScrollToTop.jsx";
import Login from "../pages/Login.jsx";
import Home from "../pages/Home.jsx";

const AppRoutes = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />


      </Routes>
    </Router>
  );
};

export default AppRoutes;
