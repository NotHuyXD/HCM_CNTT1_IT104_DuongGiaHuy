import Header from "../header/Header";
import { Outlet } from "react-router";
import NavBar from "../navbar/navbar";

export default function Home() {
  return (
    <>
      <Header />
      <div id="content">
        <NavBar />
        <Outlet />
      </div>
    </>
  );
}
