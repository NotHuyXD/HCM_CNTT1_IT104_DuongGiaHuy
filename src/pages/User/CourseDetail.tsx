/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../User/User.css"; 
import { Apis } from "../../apis";
import { CheckCircle, PlayCircle, Menu, ChevronLeft, BookOpen } from "lucide-react"; // Import thêm icon

export default function LearnPage() {
    const { courseId } = useParams();
    const API = import.meta.env.VITE_SV_HOST;

    const [course, setCourse] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);

    // --- STATE MỚI ---
    const [selectedLesson, setSelectedLesson] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Trạng thái đóng/mở sidebar

    const getUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            if(token) {
                const res = await Apis.user.me(token);
                setUserData(res);
            }
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

    const getLessons = (sessionId: string) =>
        lessons.filter((l) => String(l.sessionId) === String(sessionId));

    // ================== LOGIC TIẾN ĐỘ ==================
    const markLessonCompleted = async (lessonId: string) => {
        if (!userData || !courseId) return;

        const currentProgress = userData.learningProgress || [];
        const courseIndex = currentProgress.findIndex((p: any) => String(p.courseId) === String(courseId));

        let newProgress;

        if (courseIndex > -1) {
            const existingCourseProgress = currentProgress[courseIndex];
            if (existingCourseProgress.completedLessonIds.includes(lessonId)) return; 

            const updatedCourseProgress = {
                ...existingCourseProgress,
                completedLessonIds: [...existingCourseProgress.completedLessonIds, lessonId],
                lastAccessedDate: new Date().toISOString()
            };

            newProgress = [...currentProgress];
            newProgress[courseIndex] = updatedCourseProgress;
        } else {
            const newCourseProgress = {
                courseId: courseId,
                completedLessonIds: [lessonId],
                lastAccessedDate: new Date().toISOString()
            };
            newProgress = [...currentProgress, newCourseProgress];
        }

        try {
            await axios.patch(`${API}/users/${userData.id}`, { learningProgress: newProgress });
            setUserData((prev: any) => ({ ...prev, learningProgress: newProgress }));
        } catch (error) {
            console.error("Lỗi cập nhật tiến độ:", error);
        }
    };

    const handleSelectLesson = (lesson: any) => {
        setSelectedLesson(lesson);
        markLessonCompleted(lesson.id);
        const contentDiv = document.querySelector('.lesson-scroll-container');
        if(contentDiv) contentDiv.scrollTop = 0;
        
        // Trên mobile thì tự động đóng sidebar sau khi chọn bài
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const isLessonCompleted = (lessonId: string) => {
        if (!userData || !userData.learningProgress) return false;
        const prog = userData.learningProgress.find((p: any) => String(p.courseId) === String(courseId));
        return prog ? prog.completedLessonIds.includes(lessonId) : false;
    };

    if (loading) return <div className="loading-screen">Đang tải dữ liệu...</div>;
    if (!course) return <div className="loading-screen">⚠ Không tìm thấy khóa học</div>;

    return (
        <>
            <header className="app-header">
                <div className="header-left">
                    <h1 onClick={() => window.location.href = "/home"}>Learn-Hub</h1>
                    <div className="nav-item" onClick={() => window.location.href = "/home"}>Khóa học</div>
                    <div className="nav-item" onClick={() => window.location.href = "/confirm"}>Kiểm tra</div>
                    <div className="nav-item" onClick={() => window.location.href = "/dashboard"}>Dashboard</div>
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

            <div className="course-detail-layout">
                {/* ==== SIDEBAR (Có thể đóng mở) ==== */}
                <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-header">
                        <h2 title={course.title}>{course.title}</h2>
                        <button className="btn-close-sidebar" onClick={() => setIsSidebarOpen(false)}>
                            <ChevronLeft size={20}/>
                        </button>
                    </div>

                    <div className="sidebar-content custom-scrollbar">
                        {sessions.map((ses, index) => (
                            <div className="session" key={ses.id}>
                                <div className="session-title">
                                    <strong>Phần {index + 1}:</strong> {ses.title}
                                </div>

                                <div className="lesson-list">
                                    {getLessons(ses.id).length ? (
                                        getLessons(ses.id).map((lesson, lIdx) => {
                                            const completed = isLessonCompleted(lesson.id);
                                            const isActive = selectedLesson?.id === lesson.id;
                                            
                                            return (
                                                <div 
                                                    className={`lesson-item ${isActive ? 'active' : ''}`} 
                                                    key={lesson.id}
                                                    onClick={() => handleSelectLesson(lesson)}
                                                >
                                                    <div className="lesson-info">
                                                        <span className="lesson-idx">{lIdx + 1}.</span>
                                                        <span className="lesson-name">{lesson.title}</span>
                                                    </div>
                                                    <div className="lesson-status">
                                                        {isActive ? (
                                                            <PlayCircle size={16} className="text-blue-600" fill="currentColor" color="white"/>
                                                        ) : completed ? (
                                                            <CheckCircle size={16} className="text-emerald-500" />
                                                        ) : (
                                                            <div className="circle-placeholder"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="empty-session">Chưa có bài học</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ==== MAIN CONTENT ==== */}
                <div className="main-content-detail">
                    {/* Toolbar điều khiển phía trên */}
                    <div className="content-toolbar">
                        {!isSidebarOpen && (
                            <button className="btn-toggle-sidebar" onClick={() => setIsSidebarOpen(true)} title="Mở danh sách bài học">
                                <Menu size={24} />
                            </button>
                        )}
                        <span className="current-lesson-breadscrum">
                            {selectedLesson ? selectedLesson.title : "Giới thiệu khóa học"}
                        </span>
                    </div>

                    <div className="lesson-scroll-container custom-scrollbar">
                        <div className="lesson-inner-content">
                            {selectedLesson ? (
                                <div className="lesson-display-area">
                                    <h1 className="lesson-main-title">{selectedLesson.title}</h1>
                                    <div className="lesson-meta">
                                        Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                                    </div>
                                    <hr className="lesson-divider"/>
                                    
                                    <div 
                                        className="ql-editor-content"
                                        dangerouslySetInnerHTML={{ __html: selectedLesson.content }} 
                                    />
                                </div>
                            ) : (
                                <div className="welcome-screen">
                                    <div className="welcome-icon">
                                        <BookOpen size={60} strokeWidth={1} />
                                    </div>
                                    <h2>Chào mừng bạn đến với khóa học</h2>
                                    <h3 className="course-welcome-title">{course.title}</h3>
                                    <p>Hãy chọn bài học đầu tiên từ danh sách bên trái (hoặc bấm vào icon 3 gạch) để bắt đầu hành trình.</p>
                                    
                                    {course.backdrop && (
                                        <div className="welcome-image-wrapper">
                                            <img src={course.backdrop} alt="Course Backdrop" />
                                        </div>
                                    )}
                                </div>
                            )}

                            <footer className="content-footer">
                                © {new Date().getFullYear()} – LearnHub Learning System
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}