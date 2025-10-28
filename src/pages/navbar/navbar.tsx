import "./navbar.css";

export default function NavBar() {
  return (
    <nav>
      <p>Your Workspace</p>
      <div className="navOption" onClick={()=>{window.location.href="/home"}}>
        <i className="fa-solid fa-list-ul"></i> Boards
      </div>
      <div className="navOption">
        <i className="fa-regular fa-star"></i> Starred Boards
      </div>
      <div className="navOption">
        <i className="fa-solid fa-square-xmark"></i> Closed Boards
      </div>
      <div className="line"></div>
      <div className="navOption">
        <i className="fa-solid fa-gear"></i> Settings
      </div>
      <div className="navOption" onClick={()=>{
        window.localStorage.removeItem("token")
        window.location.href="/"
      }}>
        <i className="fa-solid fa-door-closed"></i> Sign out
      </div>
    </nav>
  );
}
