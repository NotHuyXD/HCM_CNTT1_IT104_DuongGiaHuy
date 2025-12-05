/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

// Định nghĩa kiểu dữ liệu cho 1 dòng lịch sử hiển thị
interface QuizLog {
  id: string; // ID kết hợp (userId + index) để làm key
  userId: string;
  username: string;
  email: string;
  score: number;
  totalQuestions: number;
  date: string;
}

const ITEMS_PER_PAGE = 5;

export default function QuizHistory() {
  const [historyData, setHistoryData] = useState<QuizLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // --- 1. LẤY DỮ LIỆU & XỬ LÝ ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_SV_HOST}/users`);
        const users = res.data;

        // Xử lý: Duyệt qua từng user, lấy mảng quizHistory ra và gộp vào mảng chung
        const allLogs: QuizLog[] = [];

        users.forEach((user: any) => {
          if (user.quizHistory && Array.isArray(user.quizHistory)) {
            user.quizHistory.forEach((quiz: any, index: number) => {
              allLogs.push({
                id: `${user.id}_${index}`,
                userId: user.id,
                username: user.username,
                email: user.email,
                score: quiz.score,
                totalQuestions: quiz.totalQuestions,
                date: quiz.date,
              });
            });
          }
        });

        // Sắp xếp mặc định: Mới nhất lên đầu
        allLogs.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setHistoryData(allLogs);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 2. LỌC TÌM KIẾM ---
  const filteredData = useMemo(() => {
    if (!searchTerm) return historyData;
    return historyData.filter(
      (item) =>
        item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [historyData, searchTerm]);

  // --- 3. PHÂN TRANG ---
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  // --- 4. FORMAT NGÀY THÁNG ---
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
        <i className="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu lịch sử...
      </div>
    );

  return (
    <div className="quiz-history-container">
      {/* --- CSS INLINE (Tương tự các trang Admin khác) --- */}
      <style>{`
        .quiz-history-container {
            padding: 2rem;
            width: 100%;
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            min-height: 100vh;
        }
        .qh-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .qh-header h2 {
            margin: 0;
            color: #1e293b;
            font-size: 24px;
        }
        .qh-search {
            padding: 10px 15px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            width: 300px;
            outline: none;
            transition: 0.2s;
        }
        .qh-search:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .qh-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .qh-table th {
            background: #eff6ff;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #1e3a8a;
            border-bottom: 1px solid #e2e8f0;
        }
        .qh-table td {
            padding: 15px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
        }
        .qh-table tr:hover {
            background-color: #f8fafc;
        }
        .score-badge {
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 6px;
            display: inline-block;
            min-width: 60px;
            text-align: center;
        }
        .pass { background: #dcfce7; color: #166534; }
        .fail { background: #fee2e2; color: #991b1b; }
        
        .pagination {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
        }
        .page-btn {
            padding: 8px 12px;
            border: 1px solid #cbd5e1;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            transition: 0.2s;
        }
        .page-btn:hover:not(:disabled) {
            background: #eff6ff;
            color: #2563eb;
            border-color: #2563eb;
        }
        .page-btn.active {
            background: #2563eb;
            color: white;
            border-color: #2563eb;
        }
        .page-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #64748b;
            font-style: italic;
        }
      `}</style>

      {/* --- HEADER --- */}
      <div className="qh-header">
        <h2>
          <i
            className="fa-solid fa-clock-rotate-left"
            style={{ marginRight: "10px", color: "#2563eb" }}
          ></i>
          Lịch Sử Làm Bài
        </h2>
        <input
          type="text"
          className="qh-search"
          placeholder="Tìm kiếm học viên..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* --- TABLE --- */}
      <div style={{ overflowX: "auto" }}>
        <table className="qh-table">
          <thead>
            <tr>
              <th>Học viên</th>
              <th>Email</th>
              <th>Thời gian nộp bài</th>
              <th>Điểm số</th>
              <th>Tỷ lệ</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item) => {
                const percent = Math.round(
                  (item.score / item.totalQuestions) * 100
                );
                const isPass = percent >= 70; // Giả sử 70% là đậu

                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: "500" }}>{item.username}</td>
                    <td style={{ color: "#64748b" }}>{item.email}</td>
                    <td>{formatDate(item.date)}</td>
                    <td>
                      <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                        {item.score}
                      </span>{" "}
                      / {item.totalQuestions}
                    </td>
                    <td>{percent}%</td>
                    <td>
                      <span
                        className={`score-badge ${isPass ? "pass" : "fail"}`}
                      >
                        {isPass ? "Đạt" : "Chưa đạt"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="empty-state">
                  Không tìm thấy dữ liệu nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            &laquo; Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? "active" : ""}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Sau &raquo;
          </button>
        </div>
      )}
    </div>
  );
}