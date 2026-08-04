import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import InfoProfile from "../components/cpn_personalPage/InfoProfile";
import MyFeed from "../components/cpn_personalPage/MyFeed";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/authenticationService";

export default function Home() {

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [Navigate]);

  return (
    <div className="w-full h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden w-full">
        <InfoProfile />

        <div className="flex-1 w-full min-w-0 overflow-auto">
          <MyFeed />
        </div>
      </div>
    </div>
  );
}