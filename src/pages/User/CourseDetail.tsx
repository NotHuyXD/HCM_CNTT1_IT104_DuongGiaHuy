/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../User/User.css"; 
import { Apis } from "../../apis";
import { CheckCircle, PlayCircle } from "lucide-react"; // Import thêm icon

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

    const getLessons = (sessionId: string) =>
        lessons.filter((l) => String(l.sessionId) === String(sessionId));

    // ================== LOGIC CẬP NHẬT TIẾN ĐỘ (ĐÃ SỬA) ==================
    const markLessonCompleted = async (lessonId: string) => {
        // 1. Debug: Kiểm tra xem dữ liệu đầu vào có đủ không
        console.log("Bắt đầu đánh dấu bài:", lessonId);
        if (!userData) {
            console.error("Lỗi: Chưa có thông tin User");
            return;
        }
        if (!courseId) {
            console.error("Lỗi: Không lấy được courseId");
            return;
        }

        // 2. Lấy tiến độ hiện tại, nếu chưa có field này thì tạo mảng rỗng
        const currentProgress = userData.learningProgress || [];
        
        // 3. Tìm xem user đã học khóa này chưa (Ép kiểu String để so sánh an toàn)
        const courseIndex = currentProgress.findIndex((p: any) => String(p.courseId) === String(courseId));

        let newProgress;

        if (courseIndex > -1) {
            // --- TRƯỜNG HỢP 1: Đã có tiến độ khóa này ---
            const existingCourseProgress = currentProgress[courseIndex];

            // Kiểm tra xem bài này đã xong chưa
            if (existingCourseProgress.completedLessonIds.includes(lessonId)) {
                console.log("Bài này đã hoàn thành trước đó rồi, không làm gì cả.");
                return; 
            }

            // Tạo bản sao sâu (Deep copy) để React nhận biết thay đổi
            const updatedCourseProgress = {
                ...existingCourseProgress,
                completedLessonIds: [...existingCourseProgress.completedLessonIds, lessonId],
                lastAccessedDate: new Date().toISOString()
            };

            // Cập nhật mảng mới
            newProgress = [...currentProgress];
            newProgress[courseIndex] = updatedCourseProgress;

        } else {
            // --- TRƯỜNG HỢP 2: Chưa học khóa này bao giờ ---
            console.log("Tạo tiến độ mới cho khóa học:", courseId);
            const newCourseProgress = {
                courseId: courseId, // Lưu ý: server sẽ lưu string hay number tùy vào input này
                completedLessonIds: [lessonId],
                lastAccessedDate: new Date().toISOString()
            };
            
            newProgress = [...currentProgress, newCourseProgress];
        }

        // 4. Gọi API update
        try {
            console.log("Đang gọi API PATCH với dữ liệu:", newProgress);
            
            await axios.patch(`${API}/users/${userData.id}`, {
                learningProgress: newProgress
            });

            console.log("Cập nhật thành công!");

            // 5. Cập nhật UI ngay lập tức
            setUserData((prev: any) => ({
                ...prev,
                learningProgress: newProgress
            }));

        } catch (error) {
            console.error("Lỗi khi gọi API PATCH:", error);
        }
    };

    // ================== HANDLE SELECT ==================
    const handleSelectLesson = (lesson: any) => {
        setSelectedLesson(lesson);
        
        // Gọi hàm đánh dấu hoàn thành
        markLessonCompleted(lesson.id);

        // Cuộn lên đầu
        const contentDiv = document.querySelector('.main-content-detail');
        if(contentDiv) contentDiv.scrollTop = 0;
    };

    // Helper: Kiểm tra bài học đã hoàn thành chưa để render UI
    const isLessonCompleted = (lessonId: string) => {
        if (!userData || !userData.learningProgress) return false;
        const prog = userData.learningProgress.find((p: any) => String(p.courseId) === String(courseId));
        return prog ? prog.completedLessonIds.includes(lessonId) : false;
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
                                getLessons(ses.id).map((lesson) => {
                                    const completed = isLessonCompleted(lesson.id);
                                    const isActive = selectedLesson?.id === lesson.id;
                                    
                                    return (
                                        <div 
                                            className={`lesson ${isActive ? 'active-lesson' : ''}`} 
                                            key={lesson.id}
                                            onClick={() => handleSelectLesson(lesson)}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {/* Icon Play */}
                                                <PlayCircle size={14} className={isActive ? "text-blue-600" : "text-gray-400"} />
                                                <span>{lesson.title}</span>
                                            </div>

                                            {/* Icon Check nếu đã hoàn thành */}
                                            {completed && <CheckCircle size={16} color="#10b981" fill="#d1fae5" />}
                                        </div>
                                    );
                                })
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