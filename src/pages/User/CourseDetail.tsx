/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function LearnPage() {
    const { courseId } = useParams();
    const API = import.meta.env.VITE_SV_HOST;

    const [course, setCourse] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch data
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

    if (loading) return <h2 style={{ padding: 40 }}>Đang tải...</h2>;

    if (!course)
        return <h2 style={{ padding: 40 }}>⚠ Không tìm thấy khóa học</h2>;

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            {/* ==== CSS ==== */}
            <style>{`
                body { margin:0; font-family: Arial }
                .sidebar {
                    width: 320px;
                    background: #f3f4f6;
                    border-right: 1px solid #ddd;
                    overflow-y: auto;
                }
                .sidebar h2 {
                    padding: 20px;
                    margin: 0;
                    font-size: 20px;
                    font-weight: bold;
                    background: #e5e7eb;
                }
                .session {
                    padding: 16px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .session h3 {
                    margin: 0 0 10px;
                    font-size: 17px;
                }
                .lesson {
                    padding: 10px 14px;
                    margin: 6px 0;
                    background: white;
                    border-radius: 6px;
                    border: 1px solid #ddd;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .lesson:hover { background: #e0f2fe; }
                .content {
                    flex: 1;
                    padding: 30px 50px;
                    overflow-y: auto;
                }
                footer {
                    margin-top: 40px;
                    padding: 20px 0;
                    text-align: center;
                }
            `}</style>

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
            <div className="content">
                <h1>{course.title}</h1>

                <p>
                    Đây là giao diện xem khóa học.  
                    Bạn có thể mở rộng logic hiển thị nội dung bài học khi click lesson.
                </p>

                <footer>
                    © {new Date().getFullYear()} – LearnHub Course Viewer
                </footer>
            </div>
        </div>
    );
}
