import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import ScrollToTop from "./ScrollToTop.jsx";
import Login from "../pages/Login_v2.jsx";
import Home from "../pages/Home.jsx";
import PersonalPage from "../pages/PersonalPage.jsx";
import FriendShip from "../pages/Friendship.jsx";
import Chat from "../pages/Chat.jsx";
import Registration from "../pages/Registration_v2.jsx";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    /* mode="wait" giúp trang cũ xoay đi xong trang mới mới xoay vào */
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/personal-page" element={<PersonalPage />} />
        <Route path="/friendship" element={<FriendShip />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppRoutes = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="w-screen h-screen overflow-hidden bg-gray-100">
        <AnimatedRoutes />
      </div>
    </Router>
  );
};

export default AppRoutes;
