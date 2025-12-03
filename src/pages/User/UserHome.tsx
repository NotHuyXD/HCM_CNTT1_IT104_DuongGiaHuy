/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Apis } from "../../apis";
import axios from "axios";

export default function CoursesPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [courses, setCourses] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            {/* ====================== CSS ======================= */}
            <style>{`
                body {
                    margin: 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: #f5f6f9;
                }

                /* --- HEADER STYLES --- */
                header {
                    background: #2563eb;
                    width: 100%;
                    padding: 0 24px;
                    height: 64px;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    box-sizing: border-box;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 30px;
                }

                header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .nav-links a {
                    color: rgba(255,255,255, 0.85);
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 16px;
                    margin-right: 20px;
                    transition: 0.2s;
                }

                .nav-links a:hover, .nav-links a.active {
                    color: #fff;
                    text-decoration: underline;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .user-greeting {
                    font-weight: 500;
                    font-size: 15px;
                }

                header button {
                    background: #dc2626;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    color: white;
                    cursor: pointer;
                    font-weight: 500;
                    transition: 0.2s;
                }

                header button:hover {
                    background: #b91c1c;
                }

                /* --- HERO STYLES --- */
                .hero {
                    width: 100%;
                    height: 350px;
                    background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1531482615713-2afd69097998');
                    background-size: cover;
                    background-position: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 36px;
                    font-weight: bold;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }

                /* --- CONTENT & SEARCH --- */
                .content-box {
                    padding: 40px 24px;
                    max-width: 1200px;
                    margin: auto;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .content-box h2 {
                    margin: 0;
                    color: #1f2937;
                }

                .search-input {
                    padding: 10px 16px;
                    width: 100%;
                    max-width: 350px;
                    border-radius: 8px;
                    border: 1px solid #d1d5db;
                    font-size: 15px;
                    outline: none;
                    transition: 0.2s;
                }

                .search-input:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                /* --- GRID & CARDS --- */
                .row {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                }

                .course-card-home {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    padding: 12px;
                    transition: 0.25s;
                    border: 1px solid #f3f4f6;
                    display: flex;
                    flex-direction: column;
                }

                .course-card-home:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                }

                .course-img img {
                    width: 100%;
                    height: 160px;
                    object-fit: cover;
                    border-radius: 8px;
                }

                .course-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 16px 0 8px 0;
                    color: #111827;
                    flex-grow: 1; /* Đẩy nút xem chi tiết xuống đáy */
                }

                .btn-view {
                    display: inline-block;
                    margin-top: auto;
                    color: #2563eb;
                    font-weight: 600;
                    text-decoration: none;
                    font-size: 14px;
                }

                .btn-view:hover {
                    text-decoration: underline;
                }

                footer {
                    background: #e5e7eb;
                    padding: 24px;
                    text-align: center;
                    margin-top: 60px;
                    color: #4b5563;
                }
                h4{
                    padding:6px;
                    cursor:pointer;
                    transition:0.2s background-color
                }
                h4:hover{
                background-color:gainsboro
                }
            `}</style>

            {/* ====================== HEADER ======================= */}
            <header>
                <div className="header-left">
                    <h1 onClick={() => window.location.href = "/home"}>Learn-Hub</h1>
                    <h4 onClick={() => window.location.href = "/home"}>Khóa học</h4>
                    <h4 onClick={() => window.location.href = "/exam"}>Kiểm tra</h4>
                </div>

                <div className="header-right">
                    {/* Hiển thị Hi, username */}
                    {userData && (
                        <span className="user-greeting">
                            Hi, {userData.username || userData.fullName || "User"}
                        </span>
                    )}
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </header>

            {/* ====================== HERO BANNER ======================= */}
            <div className="hero">
                Chào mừng đến với Cổng học tập trực tuyến Learn-Hub
            </div>

            {/* ====================== MAIN CONTENT ======================= */}
            <div className="content-box">
                {/* Khu vực Tiêu đề và Thanh tìm kiếm nằm cùng 1 dòng hoặc layout */}
                <div className="section-header">
                    <h2>Tất cả khóa học</h2>
                    
                    {/* Thanh tìm kiếm chuyển xuống đây */}
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Tìm kiếm khóa học..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>

                <div className="row">
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
            <footer>
                © {new Date().getFullYear()} - Hệ thống khóa học Online
            </footer>
        </>
    );
}