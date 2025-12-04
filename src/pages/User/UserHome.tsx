/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Apis } from "../../apis";
import axios from "axios";
import "../User/User.css"; // Import file CSS

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [userData, setUserData] = useState<any>(null);

    // ================== DATA KHÓA HỌC ==================
    const getCoursesData = async () => {
        try {
            const result = await axios.get(`${import.meta.env.VITE_SV_HOST}/courses`)
            setCourses((result as any).data)
        } catch (err) {
            console.log("Loi lay du lieu", err)
        }
    }

    useEffect(() => {
        getCoursesData()
    }, [])

    // ================== SEARCH STATE ==================
    const [keyword, setKeyword] = useState("");

    const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(keyword.toLowerCase())
    );

    // ================== LOGOUT ==================
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    const getUserData = async () => {
        try {
            const res = await Apis.user.me(localStorage.getItem("token"));
            setUserData(res)
        } catch (err) {
            window.location.href = "/"
            console.log(err)
        }
    }

    useEffect(() => {
        getUserData()
    }, [])

    return (
        <>
            {/* ====================== HEADER ======================= */}
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
                    <button className="btn-logout" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            {/* ====================== HERO BANNER ======================= */}
            <div className="hero">
                Chào mừng đến với Cổng học tập trực tuyến Learn-Hub
            </div>

            {/* ====================== MAIN CONTENT ======================= */}
            <div className="content-box">
                <div className="section-header">
                    <h2>Tất cả khóa học</h2>
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Tìm kiếm khóa học..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>

                <div className="course-grid-row">
                    {filtered.length > 0 ? (
                        filtered.map(course => (
                            <div key={course.id} className="course-card-home">
                                <div className="course-img">
                                    <img src={course.backdrop} alt={course.title} />
                                </div>

                                <h4 className="course-title">{course.title}</h4>

                                <a className="btn-view" href={`/course/${course.id}`}>
                                    Xem chi tiết →
                                </a>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
                            Không tìm thấy khóa học nào phù hợp.
                        </p>
                    )}
                </div>
            </div>

            {/* ====================== FOOTER ======================= */}
            <footer className="app-footer">
                © {new Date().getFullYear()} - Hệ thống khóa học Online
            </footer>
        </>
    );
}