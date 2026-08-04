import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/authenticationService";
import FriendSidebar from "../components/cpn_friendship/FriendSidebar.jsx";
import FriendDetail from "../components/cpn_friendship/FriendDetail.jsx";

export default function FriendShip() {

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [Navigate]);

  const [selectedUser, setSelectedUser] = useState(null);
  // const [currentTab, setCurrentTab] = useState("pending");

  return (
    <div className="w-full h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden w-full">
        <FriendSidebar
          onSelectUser={setSelectedUser}
          // onTabChange={setCurrentTab}
        />

        <div className="flex-1 w-full min-w-0 overflow-auto bg-linear-to-b from-blue-200 via-blue-500 to-indigo-400 animate-gradient flex justify-center items-start p-10">
          {selectedUser ? (
            <FriendDetail user={selectedUser} />
          ) : (
            <div className="flex flex-col items-center mt-20 text-gray-600">
              <i className="fa-solid fa-user text-6xl mb-4"></i>
              <p className="text-xl font-semibold">Chọn 1 người dùng bạn muốn xem thông tin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}