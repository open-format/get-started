"use client";
import React from "react";
import Leaderboard from "../components/Leaderboard";
import LogoutButton from "../components/LogoutButton";

const Home = () => {
  return (
    <div>
      <h1>Welcome to OPENFORMAT GetStarted!</h1>
      <Leaderboard />
      <LogoutButton></LogoutButton>
    </div>
  );
};

export default Home;
