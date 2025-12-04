/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Apis } from "../../apis";
import "../User/User.css"; // Import CSS

export default function QuizIntroPage() {
    const [userData, setUserData] = useState<any>(null);

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

    const handleStartQuiz = () => window.location.href = "/exam"; 
    const handleCancel = () => window.location.href = "/home";
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <>
            {/* ====================== HEADER ======================= */}
            <header className="app-header">
                <div className="header-left">
                     <h1 onClick={() => window.location.href = "/home"}>Learn-Hub</h1>
                     {/* Nếu muốn thêm menu điều hướng giống trang Home thì copy vào đây */}
                </div>
                
                <div className="header-right">
                    {userData && <span className="user-greeting">Hi, {userData.username || userData.fullName}</span>}
                    <button className="btn-logout" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            {/* ====================== BODY ======================= */}
            <div className="quiz-intro-container">
                <div className="intro-card">
                    <span className="intro-icon">📝</span>
                    
                    <h2>Xác nhận làm bài kiểm tra</h2>
                    
                    <p className="intro-desc">
                        Bạn sắp bắt đầu bài kiểm tra năng lực Front-End. 
                        Vui lòng đảm bảo kết nối mạng ổn định và không thoát trình duyệt trong quá trình làm bài.
                    </p>

                    <div className="rules-box">
                        <h4>Quy chế làm bài:</h4>
                        <ul>
                            <li><strong>Số lượng câu hỏi:</strong> 20 câu trắc nghiệm.</li>
                            <li><strong>Thời gian:</strong> 15 phút.</li>
                            <li><strong>Lưu ý:</strong> Hết thời gian hệ thống sẽ tự động nộp bài.</li>
                            <li>Không được mở tab khác trong quá trình thi.</li>
                        </ul>
                    </div>

                    <div className="action-buttons">
                        <button className="btn btn-cancel" onClick={handleCancel}>
                            Quay lại
                        </button>
                        <button className="btn btn-start" onClick={handleStartQuiz}>
                            Bắt đầu làm bài
                        </button>
                    </div>
                </div>
            </div>

            {/* ====================== FOOTER ======================= */}
            <footer className="app-footer">
                © {new Date().getFullYear()} - Hệ thống kiểm tra trực tuyến
            </footer>
        </>
    );
}