// Định nghĩa kiểu dữ liệu cho tiến độ của 1 khóa học
export interface CourseProgress {
    courseId: string;           // ID khóa học đang học
    completedLessonIds: string[]; // Danh sách ID các bài học đã hoàn thành (để tính %)
    lastAccessedDate: string;   // Thời gian truy cập gần nhất
}

// Định nghĩa kiểu dữ liệu cho lịch sử làm bài kiểm tra
export interface QuizResult {
    score: number;          // Điểm số
    totalQuestions: number; // Tổng số câu
    date: string;           // Ngày làm bài
}

export interface user {
    id: string;
    username: string;
    email: string;
    password: string;
    role: string;
    status: boolean;
    
    // --- CÁC TRƯỜNG MỚI ---
    learningProgress: CourseProgress[]; // Mảng chứa tiến độ các khóa học
    quizHistory: QuizResult[];          // Mảng chứa lịch sử làm bài test
}