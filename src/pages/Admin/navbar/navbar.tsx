import "./navbar.css";

export default function NavBar() {
  return (
    <nav>
      <p>Your Workspace</p>
      <div
        className="navOption"
        onClick={() => {
          window.location.href = "/admin";
        }}
      >
        <i className="fa-solid fa-list-ul"></i> Courses
      </div>
      <div className="navOption">
        <i className="fa-regular fa-star"></i> Starred Courses
      </div>
      <div className="navOption">
        <i className="fa-solid fa-square-xmark"></i> Closed Courses
      </div>
      <div
        className="navOption"
        onClick={() => {
          window.location.href = "/admin/manageUser";
        }}
      >
        <i className="fa-solid fa-list-ul"></i> Users
      </div>
      <div className="line"></div>
      <div className="navOption">
        <i className="fa-solid fa-gear"></i> Settings
      </div>
      <div
        className="navOption"
        onClick={() => {
          window.localStorage.removeItem("token");
          window.location.href = "/loginAdmin";
        }}
      >
        <i className="fa-solid fa-door-closed"></i> Sign out
      </div>
    </nav>
  );
}
