import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SidebarLeft from "../components/cpn_home/SidebarLeft";
import Feed from "../components/cpn_home/Feed";
import SidebarRight from "../components/cpn_home/SidebarRight_v2";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/authenticationService";

export default function Home() {

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [Navigate]);

  return (
    <div className="w-full h-screen flex flex-col select-none">
      <Navbar />

      <div className="flex flex-1 overflow-hidden w-full select-none">
        <SidebarLeft/>

        <div className="flex-1 w-full min-w-0 overflow-auto no-scrollbar">
          <Feed />
        </div>

        <SidebarRight className="w-[300px]" />
      </div>
    </div>
  );
}