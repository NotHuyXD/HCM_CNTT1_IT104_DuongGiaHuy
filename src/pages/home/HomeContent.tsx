/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, type FormEvent } from "react";
import "./home.css";
import axios from "axios";
import { Apis } from "../../apis";
import type { user } from "../../types/user.type";
import { BackTop } from "antd";
export default function HomeContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<any[]>([]);
  const [workSpace, setWorkSpace] = useState([]);
  const [starredBoard, setStarredBoard] = useState([]);
  const [userData, setUserData] = useState<user | null>(null);
  const [titleEdit, setTitleEdit] = useState("");
  const [error, setError] = useState("");
  const colors = [
    "#FF7B00",
    "#8B00FF",
    "#00FF85",
    "#00C2FF",
    "#FFE500",
    "#FF007F",
  ];

  async function getUserData() {
    try {
      const res = await Apis.user.me(localStorage.getItem("token"));
      console.log(res);
      setUserData(res as any);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu", error);
    }
  }

  async function getBoards() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SV_HOST}/boards`);
      if (!userData) return;
      const boardFiltered = res.data.filter((b) => b.userId === userData.id);

      setBoardData(boardFiltered);
      setWorkSpace(boardFiltered.filter((board) => board.is_starred === false));
      setStarredBoard(
        boardFiltered.filter((board) => board.is_starred === true)
      );
      console.log("bang:", boardFiltered);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu", error);
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    if (userData) getBoards();
  }, [userData]);

  const imgs = [
    "../src/imgs/background1.jpg",
    "../src/imgs/background2.jpg",
    "../src/imgs/background3.jpg",
    "../src/imgs/background4.jpg",
  ];

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const newData = {
      userId: userData?.id,
      title: (e.target as any).title.value,
      description: "",
      backdrop: selectedBg,
      is_starred: false,
      created_at: Date(),
    };
    if (newData.title == "") {
      setError("Please input a valid title");
    } 
    else {
      setError("");
      await Apis.board.createBoard(newData);
      await getBoards();
      setIsOpen(false);
    }
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    const newData = {
      id: editId,
      userId: userData?.id,
      title: (e.target as any).editTitle.value,
      description: "",
      backdrop: selectedBg,
      is_starred: false,
      created_at: Date(),
    };
    if (newData.title == "") {
      setError("Please input a valid title");
    } else {
      setError("");
      await axios.patch(`${import.meta.env.VITE_SV_HOST}/boards/` + editId, {
        title: (e.target as any).editTitle.value,
        backdrop: selectedBg,
      });
      await getBoards();
      setIsEditOpen(false);
      setEditId(null);
    }
  }

  return (
    <div id="BoardContent">
      <main>
        <div className="title">
          <h1>
            <i className="fa-solid fa-list-ul"></i>Your Workspaces
          </h1>
          <div id="titleOption">
            <button type="button">Share</button>
            <button type="button">Export</button>
            <select>
              <option>This Week</option>
              <option>1 Week ago</option>
            </select>
          </div>
        </div>
        <div className="line"></div>
        <div className="cardList">
          {workSpace.map((board) => (
            <div className="boardCard">
              <img src={board.backdrop} alt="Board background" />
              <h3
                className="cardTitle"
                onClick={() => {
                  window.location.href = `/home/${board.id}`;
                }}
              >
                {board.title}
              </h3>
              <button
                className="editBtn"
                onClick={() => {
                  setIsEditOpen(true);
                  setEditId(board.id);
                  setTitleEdit(board.title);
                  setSelectedBg(board.backdrop);
                }}
              >
                Edit
              </button>
            </div>
          ))}
          <div id="addCard">
            <button type="button" onClick={() => setIsOpen(true)}>
              Create New Card
            </button>
          </div>
        </div>
        <div id="title">
          <h1>
            <i className="fa-regular fa-star"></i>Starred Boards
          </h1>
        </div>
        <div className="line"></div>
        <div className="cardList">
          {starredBoard.map((board) => (
            <div className="boardCard">
              <img src={board.backdrop} alt="Board background" />
              <h3
                className="cardTitle"
                onClick={() => {
                  window.location.href = `/home/${board.id}`;
                }}
              >
                {board.title}
              </h3>
              <button
                className="editBtn"
                onClick={() => {
                  setIsEditOpen(true);
                  setEditId(board.id);
                  setTitleEdit(board.title);
                  setSelectedBg(board.backdrop);
                }}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </main>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "999",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "white",
              padding: "50px",
              borderRadius: "8px",
              minWidth: "498px",
            }}
          >
            <div className="rowFlex">
              <h3 style={{ display: "inline" }}>Create Board</h3>
              <p
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setError("");
                  setIsOpen(false);
                  setSelectedBg(null);
                  setSelectedColor(null);
                }}
              >
                X
              </p>
            </div>
            <div className="line"></div>
            <h3>Background</h3>
            <div className="rowFlex">
              {imgs.map((img) => (
                <img
                  onClick={() => setSelectedBg(img)}
                  className={selectedBg === img ? "selectedImg" : ""}
                  src={img}
                ></img>
              ))}
            </div>
            <div className="line"></div>
            <h3>Color</h3>
            <div className="colorRow">
              {colors.map((color) => (
                <div
                  key={color}
                  className={`colorBox ${
                    selectedColor === color ? "selectedColor" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                ></div>
              ))}
            </div>
            <div className="line"></div>
            <form onSubmit={handleCreate}>
              <h3>Board Title</h3>
              <input
                type="text"
                name="title"
                placeholder="E.g. Shopping list for birthday"
              ></input>
              <p>👋 Please provide a valid board title</p>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <div className="line"></div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "right",
                  alignItems: "right",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  className="closeBtn"
                  onClick={() => {
                    setError("");
                    setIsOpen(false);
                    setSelectedBg(null);
                    setSelectedColor(null);
                  }}
                >
                  Close
                </button>
                <button type="submit" className="actionBtn">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "999",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "white",
              padding: "50px",
              borderRadius: "8px",
              minWidth: "498px",
            }}
          >
            <div className="rowFlex">
              <h3 style={{ display: "inline" }}>Update Board</h3>
              <p
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setError("");
                  setIsEditOpen(false);
                  setSelectedBg(null);
                  setSelectedColor(null);
                }}
              >
                X
              </p>
            </div>
            <div className="line"></div>
            <h3>Background</h3>
            <div className="rowFlex">
              {imgs.map((img) => (
                <img
                  onClick={() => setSelectedBg(img)}
                  className={selectedBg === img ? "selectedImg" : ""}
                  src={img}
                ></img>
              ))}
            </div>
            <div className="line"></div>
            <h3>Color</h3>
            <div className="colorRow">
              {colors.map((color) => (
                <div
                  key={color}
                  className={`colorBox ${
                    selectedColor === color ? "selectedColor" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                ></div>
              ))}
            </div>
            <div className="line"></div>
            <form onSubmit={handleEdit}>
              <h3>Board Title</h3>
              <input
                type="text"
                value={titleEdit}
                onChange={(e) => setTitleEdit(e.target.value)}
                name="editTitle"
                placeholder="E.g. Shopping list for birthday"
              ></input>
              <p>👋 Please provide a valid board title</p>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <div className="line"></div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "right",
                  alignItems: "right",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  className="closeBtn"
                  onClick={() => {
                    setError("");
                    setIsEditOpen(false);
                    setSelectedBg(null);
                    setSelectedColor(null);
                  }}
                >
                  Close
                </button>
                <button type="submit" className="actionBtn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
