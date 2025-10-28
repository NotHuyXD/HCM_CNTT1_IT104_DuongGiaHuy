import React from "react";
import { Route, Routes } from "react-router";
import SignUp from "./pages/auth/signup";
import SignIn from "./pages/auth/signin";
import Home from "./pages/home/home";
import HomeContent from "./pages/home/HomeContent";
import BoardDetail from "./pages/BoardDetail/BoardDetail";

export default function RouteConfig() {
  return (
    <Routes>
      <Route path="/home" element={<Home />}>
        <Route path="/home" element={<HomeContent />}></Route>
        <Route path="/home/:boardId" element={<BoardDetail/>}></Route>
      </Route>
      <Route path="/" element={<SignIn />}></Route>
      <Route path="signup" element={<SignUp />}></Route>
    </Routes>
  );
}
