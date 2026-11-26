import { useState } from "react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";
import MainAuthPage from "./components/Auth/MainAuthPage";
import Navbar from "./components/Navbar/Navbar";
import MainPage from "./components/MainPage/MainPage";

function App() {
  return (
    // Routes
    <>
      <Navbar />
      <MainPage />
      {/* <MainAuthPage
        onLoginSuccess={(user) => console.log("Logged in:", user)}
      /> */}
    </>
  );
}

export default App;
