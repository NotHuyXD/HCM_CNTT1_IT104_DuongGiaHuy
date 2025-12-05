/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { Apis } from "../../apis";
import { BookOpen, Trophy, Activity, Calendar, PlayCircle } from "lucide-react";
import "../User/User.css";

export default function DashboardPage() {
    const API = import.meta.env.VITE_SV_HOST;
    
    // Data States
    const [userData, setUserData] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // ================== FETCH DATA ==================
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Lấy thông tin User
                const userRes = await Apis.user.me(localStorage.getItem("token"));
                setUserData(userRes);

                // 2. Lấy dữ liệu hệ thống để tính toán
                const [coursesRes, sessionsRes, lessonsRes] = await Promise.all([
                    axios.get(`${API}/courses`),
                    axios.get(`${API}/sessions`),
                    axios.get(`${API}/lessons`)
                ]);

                setCourses(coursesRes.data);
                setSessions(sessionsRes.data);
                setLessons(lessonsRes.data);
            } catch (err) {
                console.error("Lỗi tải dữ liệu dashboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // ================== HELPER FUNCTIONS ==================
    
    // Tính tổng số bài học của 1 khóa (Dựa vào Session)
    const getTotalLessonsInCourse = (courseId: string) => {
        // Tìm các session thuộc khóa học này
        const courseSessionIds = sessions
            .filter(s => String(s.courseId) === String(courseId))
            .map(s => s.id);
        
        // Đếm các lesson thuộc các session đó
        const total = lessons.filter(l => courseSessionIds.includes(l.sessionId)).length;
        return total || 1; // Tránh chia cho 0
    };

    // Lấy thông tin chi tiết khóa học theo ID
    const getCourseInfo = (courseId: string) => {
        return courses.find(c => String(c.id) === String(courseId));
    };

    // Format ngày tháng
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // ================== RENDER ==================
    if (loading) return <div className="loading-screen">Đang tải dữ liệu...</div>;
    if (!userData) return <div className="loading-screen">Vui lòng đăng nhập để xem tiến độ.</div>;

    // Tính toán thống kê nhanh
    const totalCoursesJoined = userData.learningProgress?.length || 0;
    const totalQuizzesTaken = userData.quizHistory?.length || 0;
    const avgScore = totalQuizzesTaken > 0 
        ? (userData.quizHistory.reduce((acc: number, curr: any) => acc + curr.score, 0) / totalQuizzesTaken).toFixed(1) 
        : 0;

    return (
        <>
            {/* Header reuse */}
            <header className="app-header">
                <div className="header-left">
                    <h1 onClick={() => window.location.href = "/home"}>Learn-Hub</h1>
                    <div className="nav-item" onClick={() => window.location.href = "/home"}>Khóa học</div>
                    <div className="nav-item" onClick={() => window.location.href = "/confirm"}>Kiểm tra</div>
                    <div className="nav-item" onClick={() => window.location.href = "/dashboard"}>Dashboard</div>
                </div>
                <div className="header-right">
                    <span className="user-greeting">Hi, {userData.username || userData.fullName}</span>
                    <button className="btn-logout" onClick={() => { localStorage.removeItem("token"); window.location.href = "/" }}>Logout</button>
                </div>
            </header>

            <div className="dashboard-container">
                {/* 1. SECTION: THỐNG KÊ TỔNG QUAN */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon bg-blue-100 text-blue-600"><BookOpen size={24}/></div>
                        <div>
                            <h3>{totalCoursesJoined}</h3>
                            <p>Khóa đang học</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon bg-green-100 text-green-600"><Activity size={24}/></div>
                        <div>
                            <h3>{avgScore}</h3>
                            <p>Điểm trung bình</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon bg-purple-100 text-purple-600"><Trophy size={24}/></div>
                        <div>
                            <h3>{totalQuizzesTaken}</h3>
                            <p>Bài kiểm tra đã làm</p>
                        </div>
                    </div>
                </div>

                {/* 2. SECTION: TIẾN ĐỘ HỌC TẬP */}
                <h2 className="section-title">Khóa học của tôi</h2>
                <div className="progress-grid">
                    {userData.learningProgress && userData.learningProgress.length > 0 ? (
                        userData.learningProgress.map((prog: any, index: number) => {
                            const courseInfo = getCourseInfo(prog.courseId);
                            if (!courseInfo) return null; // Nếu khóa học bị xóa khỏi hệ thống

                            const totalLessons = getTotalLessonsInCourse(prog.courseId);
                            const completedCount = prog.completedLessonIds.length;
                            const percent = Math.round((completedCount / totalLessons) * 100);

                            return (
                                <div key={index} className="progress-card">
                                    <div className="progress-card-img">
                                        <img src={courseInfo.backdrop} alt={courseInfo.title} />
                                    </div>
                                    <div className="progress-card-content">
                                        <h4>{courseInfo.title}</h4>
                                        <div className="progress-meta">
                                            <span>Đã học: {completedCount}/{totalLessons} bài</span>
                                            <span>{percent}%</span>
                                        </div>
                                        <div className="progress-bar-bg">
                                            <div className="progress-bar-fill" style={{width: `${percent}%`}}></div>
                                        </div>
                                        <a href={`/course/${prog.courseId}`} className="btn-continue">
                                            <PlayCircle size={16} style={{marginRight: 6}}/> 
                                            Tiếp tục học
                                        </a>
                                        <div className="last-access">
                                            Truy cập: {formatDate(prog.lastAccessedDate)}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <p className="empty-state">Bạn chưa tham gia khóa học nào. <a href="/home">Khám phá ngay!</a></p>
                    )}
                </div>

                {/* 3. SECTION: LỊCH SỬ KIỂM TRA */}
                <h2 className="section-title" style={{marginTop: 40}}>Lịch sử kiểm tra</h2>
                <div className="quiz-history-box">
                    {userData.quizHistory && userData.quizHistory.length > 0 ? (
                        <table className="quiz-table">
                            <thead>
                                <tr>
                                    <th>Ngày làm bài</th>
                                    <th>Điểm số</th>
                                    <th>Kết quả</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userData.quizHistory.map((quiz: any, idx: number) => {
                                    const isPass = quiz.score >= (quiz.totalQuestions * 0.7); // 70% là đậu
                                    return (
                                        <tr key={idx}>
                                            <td><div className="td-date"><Calendar size={14} style={{marginRight:5}}/> {formatDate(quiz.date)}</div></td>
                                            <td className="font-bold">{quiz.score}/{quiz.totalQuestions}</td>
                                            <td>{Math.round((quiz.score/quiz.totalQuestions)*100)}%</td>
                                            <td>
                                                <span className={`status-badge ${isPass ? 'pass' : 'fail'}`}>
                                                    {isPass ? 'Đạt' : 'Chưa đạt'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p className="empty-state">Chưa có lịch sử làm bài kiểm tra.</p>
                    )}
                </div>
                
                {/* Footer */}
                <footer className="app-footer" style={{marginTop: 50}}>
                    © {new Date().getFullYear()} – Hệ thống theo dõi học tập
                </footer>
            </div>
        </>
    );
}