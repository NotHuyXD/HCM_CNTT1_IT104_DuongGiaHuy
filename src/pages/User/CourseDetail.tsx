/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../User/User.css"; 
import { Apis } from "../../apis";

export default function LearnPage() {
    const { courseId } = useParams();
    const API = import.meta.env.VITE_SV_HOST;

    const [course, setCourse] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    // Sửa lỗi 1: Khai báo userData ngay đầu component
    const [userData, setUserData] = useState<any>(null);

    // Sửa lỗi 2: Di chuyển useEffect lấy UserData lên TRƯỚC khi return loading
    const getUserData = async () => {
        try {
            const res = await Apis.user.me(localStorage.getItem("token"));
            setUserData(res);
        } catch (err) {
            // Không nhất thiết phải redirect ngay nếu chỉ là xem bài học, 
            // nhưng nếu bắt buộc login thì giữ nguyên dòng dưới
            // window.location.href = "/"; 
            console.log(err);
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

    // Fetch Course Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseRes, sesRes, lesRes] = await Promise.all([
                    axios.get(`${API}/courses/${courseId}`),
                    axios.get(`${API}/sessions?courseId=${courseId}`),
                    axios.get(`${API}/lessons`)
                ]);

                setCourse(courseRes.data);
                setSessions(sesRes.data);
                setLessons(lesRes.data);
            } catch (err) {
                console.log("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId]);

    const getLessons = (sessionId: string) =>
        lessons.filter((l) => l.sessionId === sessionId);

    // ================== RENDER CONDITION ==================
    // Return điều kiện phải nằm SAU TẤT CẢ CÁC HOOKS
    if (loading) return <h2 style={{ padding: 40 }}>Đang tải...</h2>;
    if (!course) return <h2 style={{ padding: 40 }}>⚠ Không tìm thấy khóa học</h2>;

    return (
        /* Dùng thẻ Fragment hoặc div bao ngoài để chứa cả Header và Layout */
        <>
            {/* Header nằm trên cùng, không thuộc flex-row của layout bên dưới */}
            <header className="app-header">
                <div className="header-left">
                    <h1 onClick={() => window.location.href = "/home"}>Learn-Hub</h1>
                    <div className="nav-item" onClick={() => window.location.href = "/home"}>Khóa học</div>
                    <div className="nav-item" onClick={() => window.location.href = "/confirm"}>Kiểm tra</div>
                </div>

                <div className="header-right">
                    {userData && (
                        <span className="user-greeting">
                            Hi, {userData.username || userData.fullName || "User"}
                        </span>
                    )}
                    <button 
                        className="btn-logout" 
                        onClick={() => { localStorage.removeItem("token"); window.location.href = "/" }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Layout chính chứa Sidebar và Content */}
            {/* Thêm style height để trừ đi chiều cao header (64px) */}
            <div className="course-detail-layout" style={{ height: 'calc(100vh - 64px)' }}>
                {/* ==== SIDEBAR ==== */}
                <div className="sidebar">
                    <h2>{course.title}</h2>

                    {sessions.map((ses) => (
                        <div className="session" key={ses.id}>
                            <h3>{ses.title}</h3>

                            {getLessons(ses.id).length ? (
                                getLessons(ses.id).map((lesson) => (
                                    <div className="lesson" key={lesson.id}>
                                        {lesson.title}
                                    </div>
                                ))
                            ) : (
                                <div style={{ opacity: 0.6 }}>Không có bài học</div>
                            )}
                        </div>
                    ))}
                </div>

                {/* ==== MAIN CONTENT ==== */}
                <div className="main-content-detail">
                    <h1>{course.title}</h1>

                    <p>
                        Đây là giao diện xem khóa học.  
                        Bạn có thể mở rộng logic hiển thị nội dung bài học khi click lesson.
                    </p>

                    <footer className="app-footer" style={{ marginTop: '40px' }}>
                        © {new Date().getFullYear()} – LearnHub Course Viewer
                    </footer>
                </div>
            </div>
        </>
    );
}