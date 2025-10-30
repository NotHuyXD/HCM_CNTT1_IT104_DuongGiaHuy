/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type FormEvent } from "react";
import "./BoardDetail.css";
import axios from "axios";
import { useParams } from "react-router";
import type { list } from "../../types/list.type";
import type { task } from "../../types/task.type";
import type { board } from "../../types/board.type";
import type { tag } from "../../types/tag.type";
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";

export default function BoardDetail() {
  const dynamicData = useParams();
  const boardId = dynamicData.boardId;
  const [listId, setListId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<board | null>(null);
  const [listData, setListData] = useState<list[] | null>(null);
  const [taskData, setTaskData] = useState<task[]>([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [closeBoard, setCloseBoard] = useState(false);
  const [listModal, setListModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [labelModal, setLabelModal] = useState(false);
  const [dateModal, setDateModal] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [moveModal, setMoveModal] = useState(false);
  const [createLabelModal, setCreateLabelModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [labels, setLabels] = useState<tag[] | null>(null);
  const [selectedListValue, setSelectedListValue] = useState<string | null>(
    null
  );
  const [taskDetailModal, setTaskDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<task | null>(null);
  const [descriptionValue, setDescriptionValue] = useState("");
  const [error, setError] = useState("");

  async function getBoardData() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SV_HOST}/boards/` + boardId
      );
      setBoardData(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function getListData() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SV_HOST}/lists?boardId=` + boardId
      );
      setListData(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function getTaskData() {
    const res = await axios.get(`${import.meta.env.VITE_SV_HOST}/tasks`);
    setTaskData(res.data);
  }

  function closeAllModals() {
    setOpenFilter(false);
    setDeleteModal(false);
    setCloseBoard(false);
    setListModal(false);
    setTaskModal(false);
    setLabelModal(false);
    setDateModal(false);
    setMoveModal(false);
    setCreateLabelModal(false);
    setTaskDetailModal(false);
  }

  useEffect(() => {
    getBoardData();
    getListData();
    getTaskData();
  }, []);

  function renderTasksByList(listId: string) {
    const tasks = taskData.filter((t) => t.listId === listId);
    return tasks.map((t) => (
      <div
        key={t.id}
        className="taskItem"
        onClick={() => {
          setSelectedTask(t);
          setDescriptionValue(t.description || "");
          setTaskDetailModal(true);
          setStatus(listData?.find((list) => list.id === t.listId)?.title);
        }}
        style={{ cursor: "pointer" }}
      >
        <p>{t.title}</p>
      </div>
    ));
  }

  async function createList(e: FormEvent) {
    e.preventDefault();
    const newList = {
      boardId: boardId,
      title: (e.target as any).listTitle.value,
      created_at: Date(),
    };
    if (newList.title == "") {
      setError("Please input list title");
    } else {
      setError("");
      await axios.post(`${import.meta.env.VITE_SV_HOST}/lists`, newList);
      await getListData();
      setListModal(false);
    }
  }

  async function createTask(e: FormEvent) {
    e.preventDefault();
    const newTask = {
      listId: listId,
      title: (e.target as any).taskTitle.value,
      description: "",
      status: status,
      due_date: Date(),
      created_at: Date(),
    };
    if (newTask.title == "") {
      setError("Please input task title");
    } else {
      setError("");
      await axios.post(`${import.meta.env.VITE_SV_HOST}/tasks`, newTask);
      await getTaskData();
      setTaskModal(false);
    }
  }

  async function changeStarred() {
    await axios.patch(`${import.meta.env.VITE_SV_HOST}/boards/` + boardId, {
      is_starred: boardData?.is_starred === false ? true : false,
    });
  }

  async function createLabel(e) {
    const newLabel = {
      taskId: selectedTask?.id,
      color: selectedColor,
      content: e.target.labelTitle,
    };
    if (newLabel.content == "") {
      setError("Please input label title");
    } else {
      setError("");
      await axios.post(`${import.meta.env.VITE_SV_HOST}/tags`, newLabel);
      setCreateLabelModal(false);
    }
  }

  return (
    <div id="boardDetail">
      <div id="titleBar">
        <div id="left">
          <h1>{boardData?.title}</h1>
          <i
            className={
              boardData?.is_starred ? "fa-solid fa-star" : "fa-regular fa-star"
            }
            onClick={async ()=>{changeStarred();await getBoardData()}}
          ></i>
          <div className="titleButton">
            <i className="fa-solid fa-chart-simple"></i>
            <p>Board</p>
          </div>
          <div className="titleButton">
            <i className="fa-solid fa-table"></i>
            <p>Table</p>
          </div>
          <div
            className="titleButton"
            style={{ width: "150px" }}
            onClick={() => setCloseBoard(true)}
          >
            <i className="fa-solid fa-square-xmark"></i>
            <p>Close this board</p>
          </div>
        </div>
        <div id="filterButton" onClick={() => setOpenFilter(true)}>
          <i className="fa-solid fa-filter"></i>
          <p>Filter</p>
        </div>
      </div>
      <div id="taskList">
        {listData?.map((list) => (
          <div key={list.id} className="taskCard">
            <div className="headCard">
              <p>{list.title}</p>
              <p>...</p>
            </div>

            {renderTasksByList(list.id)}

            <div className="headCard">
              <p
                onClick={() => {
                  setTaskModal(true);
                  setListId(list.id);
                  setStatus(list.title);
                }}
                style={{ cursor: "pointer" }}
              >
                + Add a card
              </p>
              <img
                src="../src/imgs/buttonCard.png"
                style={{ width: "32px", height: "32px" }}
              />
            </div>
          </div>
        ))}

        <div id="addList">
          <h5 onClick={() => setListModal(true)}>+ Add another list</h5>
        </div>
      </div>

      {taskDetailModal && selectedTask && (
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
            zIndex: "997",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "30px",
              width: "850px",
              maxHeight: "90vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              className="rowFlex"
              style={{ justifyContent: "space-between" }}
            >
              <h2>{selectedTask.title}</h2>
              <p
                style={{ cursor: "pointer", fontWeight: "bold" }}
                onClick={() => {
                  setStatus(null);
                  setTaskDetailModal(false);
                }}
              >
                X
              </p>
            </div>
            <div
              className="rowFlex"
              style={{ justifyContent: "left", alignItems: "center" }}
            >
              <h5>In List:</h5>
              <p
                style={{
                  border: "1px solid gray",
                  borderRadius: "6px",
                  padding: "6px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedListValue(
                    listData?.find((list) => list.id === selectedTask.listId)
                      ?.title
                  );
                  setMoveModal(true);
                }}
              >
                {status}
              </p>
            </div>

            <div className="rowFlex">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "30px",
                }}
              >
                <p style={{ fontWeight: "bold" }}>Description</p>
                <ReactQuill
                  theme="snow"
                  value={descriptionValue}
                  onChange={setDescriptionValue}
                  placeholder="Enter task description..."
                  style={{
                    width: "600px",
                    height: "200px",
                    marginBottom: "20px",
                    background: "white",
                  }}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link", "image"],
                      ["clean"],
                    ],
                  }}
                />
                <div
                  className="rowFlex"
                  style={{ gap: "10px", justifyContent: "left" }}
                >
                  <button
                    type="button"
                    style={{
                      backgroundColor: "#3085d6",
                      color: "white",
                      borderRadius: "8px",
                      border: "0",
                      padding: "12px 24px",
                      cursor: "pointer",
                    }}
                    onClick={async () => {
                      await axios.patch(
                        `${import.meta.env.VITE_SV_HOST}/tasks/${
                          selectedTask.id
                        }`,
                        {
                          description: descriptionValue,
                          listId: listData?.find(
                            (l) => l.title === selectedListValue
                          )?.id,
                          status: selectedListValue,
                        }
                      );
                      await getTaskData();
                      setTaskDetailModal(false);
                      setStatus(null);
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: "#ddd",
                      color: "#333",
                      borderRadius: "8px",
                      border: "0",
                      padding: "12px 24px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setStatus(null);
                      setTaskDetailModal(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    borderRadius: "6px",
                    width: "168px",
                    border: "0",
                    textAlign: "left",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={async () => {
                    setLabelModal(true);
                    const res = await axios.get(
                      `${import.meta.env.VITE_SV_HOST}/tags?taskId=` +
                        selectedTask.id
                    );
                    setLabels(res.data);
                  }}
                >
                  <img
                    src="../src/imgs/labelButton.png"
                    style={{ width: "150px", height: "40px" }}
                  />
                </div>
                <div
                  style={{
                    borderRadius: "6px",
                    width: "168px",
                    border: "0",
                    textAlign: "left",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => setDateModal(true)}
                >
                  <img
                    src="../src/imgs/dateButton.png"
                    style={{ width: "150px", height: "40px" }}
                  />
                </div>
                <div
                  style={{
                    borderRadius: "6px",
                    width: "168px",
                    border: "0",
                    textAlign: "left",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    setDeleteModal(true);
                  }}
                >
                  <img
                    src="../src/imgs/deleteButton.png"
                    style={{ width: "150px", height: "40px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {openFilter && (
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
              padding: "20px",
              borderRadius: "8px",
              minWidth: "498px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <p>Filter</p>
            <form
              style={{ display: "flex", flexDirection: "column", gap: "1px" }}
            >
              <div className="rowFlex">
                <h5>Keyword</h5>
                <p
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setOpenFilter(false);
                  }}
                >
                  X
                </p>
              </div>
              <input type="text" name="taskName"></input> <p>Search cards</p>
              <h5>Card Status</h5>
              <div className="rowFlex" style={{ justifyContent: "left" }}>
                <input
                  type="checkbox"
                  name="status"
                  checked={statusFilter === "completed"}
                  onClick={() => {
                    setStatusFilter(
                      statusFilter === "completed" ? null : "completed"
                    );
                  }}
                ></input>
                <p>Mark as completed</p>
              </div>
              <div className="rowFlex" style={{ justifyContent: "left" }}>
                <input
                  type="checkbox"
                  name="status"
                  checked={statusFilter === "incompleted"}
                  onClick={() => {
                    setStatusFilter(
                      statusFilter === "incompleted" ? null : "incompleted"
                    );
                  }}
                ></input>
                <p>Not mark as completed</p>
              </div>
              <h5>Due Date</h5>
              <div className="rowFlex" style={{ justifyContent: "left" }}>
                <input
                  type="checkbox"
                  name="date"
                  checked={dateFilter === "noDate"}
                  onClick={() => {
                    setDateFilter(dateFilter === "noDate" ? null : "noDate");
                  }}
                ></input>
                <p>No dates</p>
              </div>
              <div className="rowFlex" style={{ justifyContent: "left" }}>
                <input
                  type="checkbox"
                  name="date"
                  checked={dateFilter === "overdue"}
                  onClick={() => {
                    setDateFilter(dateFilter === "overdue" ? null : "overdue");
                  }}
                ></input>
                <p>Overdue</p>
              </div>
              <div className="rowFlex" style={{ justifyContent: "left" }}>
                <input
                  type="checkbox"
                  name="date"
                  checked={dateFilter === "nextDay"}
                  onClick={() => {
                    setDateFilter(dateFilter === "nextDay" ? null : "nextDay");
                  }}
                ></input>
                <p>Due in next day</p>
              </div>
              <h5>Labels</h5>
              <div className="rowFlex" style={{ justifyContent: "left" }}>
                <input
                  type="checkbox"
                  name="label"
                  checked={labelFilter === "noLabel"}
                  onClick={() => {
                    setLabelFilter(dateFilter === "noLabel" ? null : "noLabel");
                  }}
                ></input>
                <p>No labels</p>
              </div>
              <div
                className="rowFlex"
                style={{ justifyContent: "left", marginTop: "10px" }}
              >
                <input
                  type="checkbox"
                  name="label"
                  checked={labelFilter === "green"}
                  onClick={() => {
                    setLabelFilter(dateFilter === "green" ? null : "green");
                  }}
                ></input>
                <div
                  className="label"
                  style={{ backgroundColor: "green" }}
                ></div>
              </div>
              <div
                className="rowFlex"
                style={{ justifyContent: "left", marginTop: "10px" }}
              >
                <input
                  type="checkbox"
                  name="label"
                  checked={labelFilter === "red"}
                  onClick={() => {
                    setLabelFilter(dateFilter === "red" ? null : "red");
                  }}
                ></input>
                <div className="label" style={{ backgroundColor: "red" }}></div>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteModal && (
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
              alignItems: "center",
              background: "white",
              padding: "50px",
              borderRadius: "8px",
              minWidth: "498px",
            }}
          >
            <img
              src="../src/imgs/warning.png"
              style={{ width: "88px", height: "88px" }}
            />
            <h1>Are you sure?</h1> <p>You won't be able to revert this</p>
            <div className="rowFlex">
              <button
                type="button"
                style={{
                  backgroundColor: "#3085d6",
                  color: "white",
                  borderRadius: "8px",
                  border: "0",
                  padding: "20px",
                  cursor: "pointer",
                }}
                onClick={async () => {
                  await axios.delete(
                    `${import.meta.env.VITE_SV_HOST}/tasks/` + selectedTask.id
                  );
                  await getTaskData();
                  closeAllModals();
                }}
              >
                Yes, delete it!
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteModal(false);
                }}
                style={{
                  backgroundColor: "#dd3333",
                  color: "white",
                  borderRadius: "8px",
                  border: "0",
                  padding: "20px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {closeBoard && (
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
              alignItems: "center",
              background: "white",
              padding: "50px",
              borderRadius: "8px",
              minWidth: "498px",
            }}
          >
            <img
              src="../src/imgs/warning.png"
              style={{ width: "88px", height: "88px" }}
            />
            <h1>Are you sure?</h1> <p>You won't be able to revert this</p>
            <div className="rowFlex">
              <button
                type="button"
                style={{
                  backgroundColor: "#3085d6",
                  color: "white",
                  borderRadius: "8px",
                  border: "0",
                  padding: "20px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  window.location.href = "/home";
                }}
              >
                Yes, close it!
              </button>
              <button
                type="button"
                onClick={() => {
                  setCloseBoard(false);
                }}
                style={{
                  backgroundColor: "#dd3333",
                  color: "white",
                  borderRadius: "8px",
                  border: "0",
                  padding: "20px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {listModal && (
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
              alignItems: "center",
              background: "white",
              padding: "50px",
              borderRadius: "8px",
              minWidth: "498px",
            }}
          >
            <form
              onSubmit={createList}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <h1>Create new list</h1>
              <input type="text" name="listTitle"></input>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <div className="rowFlex">
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#3085d6",
                    color: "white",
                    borderRadius: "8px",
                    border: "0",
                    padding: "20px",
                    cursor: "pointer",
                  }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setListModal(false);
                    setError("");
                  }}
                  style={{
                    backgroundColor: "#dd3333",
                    color: "white",
                    borderRadius: "8px",
                    border: "0",
                    padding: "20px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {taskModal && (
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
              alignItems: "center",
              background: "white",
              padding: "50px",
              borderRadius: "8px",
              minWidth: "498px",
            }}
          >
            <form
              onSubmit={createTask}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <h1>Create new task</h1>
              <input type="text" name="taskTitle"></input>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <div className="rowFlex">
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#3085d6",
                    color: "white",
                    borderRadius: "8px",
                    border: "0",
                    padding: "20px",
                    cursor: "pointer",
                  }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTaskModal(false);
                    setError("");
                  }}
                  style={{
                    backgroundColor: "#dd3333",
                    color: "white",
                    borderRadius: "8px",
                    border: "0",
                    padding: "20px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {createLabelModal && (
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
              alignItems: "center",
              background: "white",
              padding: "50px",
              borderRadius: "8px",
              minWidth: "498px",
            }}
          >
            <form
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                width: "100%",
              }}
            >
              <div
                className="rowFlex"
                style={{ justifyContent: "space-between" }}
              >
                <h2>Create Label</h2>
                <p
                  style={{ cursor: "pointer", fontWeight: "bold" }}
                  onClick={() => {setCreateLabelModal(false);setError("")}}
                >
                  X
                </p>
              </div>

              <label style={{ fontWeight: "bold" }}>Title</label>
              <input
                type="text"
                name="labelTitle"
                placeholder="Enter label name"
              />
              {error && <p style={{ color: "red" }}>{error}</p>}
              <label style={{ fontWeight: "bold" }}>Select color</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "10px",
                }}
              >
                {[
                  "#4caf50",
                  "#ff9800",
                  "#f44336",
                  "#2196f3",
                  "#9c27b0",
                  "#ffc107",
                  "#03a9f4",
                  "#8bc34a",
                  "#e91e63",
                  "#795548",
                ].map((color) => (
                  <div
                    key={color}
                    className={`colorBox ${
                      selectedColor === color ? "selectedColor" : ""
                    }`}
                    style={{
                      width: "92px",
                      height: "42px",
                      backgroundColor: color,
                      borderRadius: "6px",
                      cursor: "pointer",
                      border: "1px solid #ddd",
                    }}
                    onClick={() => setSelectedColor(color)}
                  ></div>
                ))}
              </div>

              <div
                className="rowFlex"
                style={{ justifyContent: "flex-end", gap: "10px" }}
              >
                <button
                  type="button"
                  style={{
                    backgroundColor: "#3085d6",
                    color: "white",
                    borderRadius: "8px",
                    border: "0",
                    padding: "12px 24px",
                    cursor: "pointer",
                  }}
                  onClick={createLabel}
                >
                  Create
                </button>
                <button
                  type="button"
                  style={{
                    backgroundColor: "#dd3333",
                    color: "white",
                    borderRadius: "8px",
                    border: "0",
                    padding: "12px 24px",
                    cursor: "pointer",
                  }}
                  onClick={() => {setCreateLabelModal(false);setError("")}}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {labelModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "998",
            backdropFilter: "blur(3px)",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "10px",
              padding: "30px",
              width: "400px",
              maxHeight: "80vh",
              overflowY: "auto",
              animation: "fadeIn 0.2s ease-in-out",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="rowFlex"
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2>Labels</h2>
              <p
                style={{ cursor: "pointer", fontWeight: "bold" }}
                onClick={() => setLabelModal(false)}
              >
                ✕
              </p>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {labels?.map((label) => (
                <div
                  key={label.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#f9f9f9",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    justifyContent: "space-between",
                    transition: "transform 0.15s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.01)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1.0)")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flex: 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{
                        width: "18px",
                        height: "18px",
                        accentColor: label.color,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setSelectedLabel(selectedLabel === label ? null : label)
                      }
                      checked={selectedLabel === label}
                    />

                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: label.color,
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontWeight: "500",
                      }}
                    >
                      {label.content}
                    </div>
                  </div>

                  <span style={{ cursor: "pointer", marginLeft: "10px" }}>
                    ✏️
                  </span>
                </div>
              ))}
            </div>

            <div
              onClick={() => setCreateLabelModal(true)}
              style={{
                textAlign: "center",
                marginTop: "20px",
                fontWeight: "600",
                color: "#1e40af",
                backgroundColor: "#ddd",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              + Create a new label
            </div>
          </div>
        </div>
      )}
      {moveModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "998",
            backdropFilter: "blur(3px)",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "10px",
              padding: "30px",
              width: "400px",
              maxHeight: "80vh",
              overflowY: "auto",
              animation: "fadeIn 0.2s ease-in-out",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="rowFlex"
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2>Move card</h2>
              <p
                style={{ cursor: "pointer", fontWeight: "bold" }}
                onClick={() => {
                  setMoveModal(false);
                }}
              >
                ✕
              </p>
            </div>
            <p>Select destination</p>
            <h2>Board</h2>
            <p
              style={{
                border: "1px solid black",
                borderRadius: "6px",
                width: "380px",
                padding: "10px",
              }}
            >
              {boardData?.title}
            </p>
            <div className="rowFlex">
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h2>List</h2>
                <select
                  name="statusValue"
                  value={selectedListValue || ""}
                  onChange={(e) => {
                    setSelectedListValue(e.target.value);
                  }}
                  style={{
                    borderRadius: "6px",
                    width: "250px",
                    padding: "10px",
                  }}
                >
                  {listData?.map((list) => (
                    <option key={list.id} value={list.title}>
                      {list.title}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h2>Position</h2>
                <select
                  style={{
                    borderRadius: "6px",
                    width: "100px",
                    padding: "10px",
                  }}
                  value={selectedTask?.id}
                ></select>
              </div>
              <button
                type="button"
                style={{
                  padding: "10px",
                  textAlign: "center",
                  borderRadius: "8px",
                  border: "0",
                  cursor: "pointer",
                  backgroundColor: "#0c66e4",
                  color: "white",
                  width: "100px",
                }}
                onClick={() => {
                  if (selectedListValue) {
                    setStatus(selectedListValue);
                    setMoveModal(false);
                  }
                }}
              >
                Move
              </button>
            </div>
          </div>
        </div>
      )}
      {dateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            backdropFilter: "blur(3px)",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              width: "344px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              animation: "fadeIn 0.2s ease-in-out",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: "600" }}>Dates</h3>
              <p
                onClick={() => setDateModal(false)}
                style={{ cursor: "pointer", fontWeight: "bold" }}
              >
                ✕
              </p>
            </div>

            {/* Calendar */}
            <input
              type="date"
              style={{
                width: "90%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
              value={startDate || ""}
              onChange={(e) => setStartDate(e.target.value)}
            />

            {/* Start date toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="start-date"
                checked={!!startDate}
                onChange={(e) =>
                  setStartDate(
                    e.target.checked
                      ? new Date().toISOString().slice(0, 10)
                      : ""
                  )
                }
              />
              <label htmlFor="start-date" style={{ cursor: "pointer" }}>
                Start date
              </label>
            </div>

            {/* Due date */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <input
                  type="checkbox"
                  id="due-date"
                  checked={!!dueDate}
                  onChange={(e) =>
                    setDueDate(
                      e.target.checked
                        ? new Date().toISOString().slice(0, 10)
                        : ""
                    )
                  }
                />
                <label htmlFor="due-date" style={{ cursor: "pointer" }}>
                  Due date
                </label>
              </div>
              {dueDate && (
                <input
                  type="datetime-local"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              )}
            </div>

            {/* Buttons */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <button
                type="button"
                style={{
                  backgroundColor: "#0c66e4",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
                onClick={() => {
                  console.log("Saved:", { startDate, dueDate });
                  setDateModal(false);
                }}
              >
                Save
              </button>
              <button
                type="button"
                style={{
                  backgroundColor: "#f4f5f7",
                  color: "#172b4d",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setStartDate("");
                  setDueDate("");
                  setDateModal(false);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
