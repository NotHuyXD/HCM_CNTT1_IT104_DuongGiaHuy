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
    const [userData, setUserData] = useState<any>(null);

    // --- STATE MỚI: Lưu bài học đang được chọn ---
    const [selectedLesson, setSelectedLesson] = useState<any>(null);

    const getUserData = async () => {
        try {
            const res = await Apis.user.me(localStorage.getItem("token"));
            setUserData(res);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

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

    // Hàm lọc lesson theo session (Convert String để so sánh an toàn vì db có thể lẫn lộn string/number)
    const getLessons = (sessionId: string) =>
        lessons.filter((l) => String(l.sessionId) === String(sessionId));

    // Handle chọn bài học
    const handleSelectLesson = (lesson: any) => {
        setSelectedLesson(lesson);
        // Cuộn lên đầu trang nội dung khi chuyển bài
        const contentDiv = document.querySelector('.main-content-detail');
        if(contentDiv) contentDiv.scrollTop = 0;
    };

    if (loading) return <h2 style={{ padding: 40 }}>Đang tải...</h2>;
    if (!course) return <h2 style={{ padding: 40 }}>⚠ Không tìm thấy khóa học</h2>;

    return (
        <>
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

            <div className="course-detail-layout" style={{ height: 'calc(100vh - 64px)' }}>
                {/* ==== SIDEBAR ==== */}
                <div className="sidebar">
                    <h2>{course.title}</h2>

                    {sessions.map((ses) => (
                        <div className="session" key={ses.id}>
                            <h3>{ses.title}</h3>

                            {getLessons(ses.id).length ? (
                                getLessons(ses.id).map((lesson) => (
                                    <div 
                                        // Thêm class 'active-lesson' nếu bài này đang được chọn
                                        className={`lesson ${selectedLesson?.id === lesson.id ? 'active-lesson' : ''}`} 
                                        key={lesson.id}
                                        // Sự kiện click để hiển thị nội dung
                                        onClick={() => handleSelectLesson(lesson)}
                                    >
                                        <span className="icon-play">▶</span> {lesson.title}
                                    </div>
                                ))
                            ) : (
                                <div style={{ opacity: 0.6, paddingLeft: 14, fontSize: 14 }}>Chưa có bài học</div>
                            )}
                        </div>
                    ))}
                </div>

                {/* ==== MAIN CONTENT ==== */}
                <div className="main-content-detail">
                    {selectedLesson ? (
                        <div className="lesson-display-area">
                            <h1 className="lesson-title">{selectedLesson.title}</h1>
                            <hr style={{margin: '20px 0', border: '1px solid #eee'}}/>
                            
                            {/* Render HTML từ ReactQuill */}
                            <div 
                                className="ql-editor-content"
                                dangerouslySetInnerHTML={{ __html: selectedLesson.content }} 
                            />
                        </div>
                    ) : (
                        <div className="welcome-screen">
                            <h2>Chào mừng bạn đến với khóa học: {course.title}</h2>
                            <p>Vui lòng chọn một bài học ở danh sách bên trái để bắt đầu.</p>
                            <img 
                                src={course.backdrop} 
                                alt="Course Backdrop" 
                                style={{marginTop: 20, maxWidth: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                            />
                        </div>
                    )}

                    <footer className="app-footer" style={{ marginTop: '40px' }}>
                        © {new Date().getFullYear()} – LearnHub Course Viewer
                    </footer>
                </div>
            </div>
        </>
    );
}