import React from "react";
import { Route, Routes } from "react-router";
import SignUp from "./pages/auth/signup";
import SignIn from "./pages/auth/signin";
import Admin from "./pages/Admin/home/Admin";
import AdminContent from "./pages/Admin/home/AdminContent";
import AdminDetail from "./pages/Admin/AdminDetail/AdminDetail";
import SignInAdmin from "./pages/auth/signinAdmin";
import UserManagement from "./pages/Admin/ManageUser/manageUser";
import CoursesPage from "./pages/User/UserHome";
import LearnPage from "./pages/User/CourseDetail";
import Quiz from "./pages/User/Quiz";
import QuizIntroPage from "./pages/User/QuizIntroPage";

export default function RouteConfig() {
  return (
    <Routes>
      <Route path="/loginAdmin" element={<SignInAdmin/>}></Route>
      <Route path="/admin" element={<Admin />}>
        <Route path="/admin" element={<AdminContent />}></Route>
        <Route path="/admin/:courseId" element={<AdminDetail/>}></Route>
        <Route path="/admin/manageUser" element={<UserManagement/>}></Route>
      </Route>
      <Route path="/" element={<SignIn />}></Route>
      <Route path="signup" element={<SignUp />}></Route>
      <Route path="/home" element={<CoursesPage/>}></Route>
      <Route path="/course/:courseId" element={<LearnPage/>}></Route>
      <Route path="/exam" element={<Quiz/>}></Route>
      <Route path="/confirm" element={<QuizIntroPage/>}></Route>
    </Routes>
  );
}
