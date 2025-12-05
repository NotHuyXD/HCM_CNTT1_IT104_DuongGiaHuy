import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
// 1. ĐỔI PORT SERVER SANG 5000 (Tránh xung đột với MySQL 8080)
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 2. KẾT NỐI MYSQL (Lưu ý Port 8080 theo hình ảnh bạn gửi)
// Thay createConnection bằng createPool
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'huy0965507655',
    database: process.env.DB_NAME || 'my_elearning_db',
    port: process.env.DB_PORT || 8080,

    // Thêm các cấu hình cho Pool
    waitForConnections: true,
    connectionLimit: 10, // Tối đa 10 kết nối cùng lúc
    queueLimit: 0,
    enableKeepAlive: true, // Giữ kết nối sống lâu hơn
    keepAliveInitialDelay: 0
});

// Pool không cần gọi db.connect(), nó tự động kết nối khi cần.
// Ta chỉ cần log ra để biết server đã khởi động.
console.log('✅ Đã khởi tạo Connection Pool (Tự động nối lại khi bị ngắt)!');

// Helper function: Biến MySQL Query thành Promise
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

// =============================================================
// PHẦN 1: API USER (Đăng nhập, Đăng ký, Cập nhật tiến độ)
// =============================================================

// GET USERS (Hỗ trợ lọc ?email=... cho chức năng Đăng nhập)
app.get('/users', async(req, res) => {
    try {
        let sql = "SELECT * FROM users";
        let params = [];
        let conditions = [];

        // Hỗ trợ lọc theo email, password, username, id
        if (req.query.email) {
            conditions.push("email = ?");
            params.push(req.query.email);
        }
        if (req.query.password) {
            conditions.push("password = ?");
            params.push(req.query.password);
        }
        if (req.query.id) {
            conditions.push("id = ?");
            params.push(req.query.id);
        }

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        const users = await query(sql, params);

        // Format dữ liệu JSON string thành Object
        const formattedUsers = users.map(u => ({
            ...u,
            status: Boolean(u.status),
            learningProgress: typeof u.learningProgress === 'string' ? JSON.parse(u.learningProgress) : u.learningProgress || [],
            quizHistory: typeof u.quizHistory === 'string' ? JSON.parse(u.quizHistory) : u.quizHistory || []
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error("Lỗi GET /users:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET USER BY ID (Cho trang Home/Dashboard)
app.get('/users/:id', async(req, res) => {
    try {
        const users = await query("SELECT * FROM users WHERE id = ?", [req.params.id]);
        if (users.length === 0) return res.status(404).json({});

        const u = users[0];
        const formattedUser = {
            ...u,
            status: Boolean(u.status),
            learningProgress: typeof u.learningProgress === 'string' ? JSON.parse(u.learningProgress) : u.learningProgress || [],
            quizHistory: typeof u.quizHistory === 'string' ? JSON.parse(u.quizHistory) : u.quizHistory || []
        };
        res.json(formattedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST USER (Đăng ký)
app.post('/users', async(req, res) => {
    try {
        const { id, username, email, password, role, status, learningProgress, quizHistory } = req.body;
        // Nếu không gửi ID thì tự tạo ID ngẫu nhiên
        const newId = id || Math.random().toString(36).substr(2, 9);

        const sql = `INSERT INTO users (id, username, email, password, role, status, learningProgress, quizHistory) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            newId, username, email, password, role || 'user', status ? 1 : 1,
            JSON.stringify(learningProgress || []),
            JSON.stringify(quizHistory || [])
        ];

        await query(sql, values);
        // Trả về object vừa tạo
        res.json({...req.body, id: newId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH USER (Cập nhật tiến độ học / Kết quả thi)
app.patch('/users/:id', async(req, res) => {
    const id = req.params.id;
    const updates = req.body;
    let fields = [];
    let values = [];

    for (const [key, value] of Object.entries(updates)) {
        if (key === 'id') continue;
        fields.push(`${key} = ?`);

        // Stringify các trường JSON
        if (key === 'learningProgress' || key === 'quizHistory') {
            values.push(JSON.stringify(value));
        } else if (key === 'status') {
            values.push(value ? 1 : 0);
        } else {
            values.push(value);
        }
    }

    if (fields.length === 0) return res.json({ message: "Không có gì để update" });

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    try {
        await query(sql, values);

        // Lấy lại dữ liệu mới nhất để trả về Frontend cập nhật state
        const updatedUserRaw = await query("SELECT * FROM users WHERE id = ?", [id]);
        const u = updatedUserRaw[0];
        const formattedUser = {
            ...u,
            status: Boolean(u.status),
            learningProgress: typeof u.learningProgress === 'string' ? JSON.parse(u.learningProgress) : u.learningProgress,
            quizHistory: typeof u.quizHistory === 'string' ? JSON.parse(u.quizHistory) : u.quizHistory
        };
        res.json(formattedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =============================================================
// PHẦN 2: API COURSES (Khóa học)
// =============================================================

app.get('/courses', async(req, res) => {
    try {
        const data = await query("SELECT * FROM courses");
        res.json(data);
    } catch (err) { res.status(500).json(err); }
});

app.get('/courses/:id', async(req, res) => {
    try {
        const data = await query("SELECT * FROM courses WHERE id = ?", [req.params.id]);
        if (data.length > 0) res.json(data[0]);
        else res.status(404).json({ message: "Not found" });
    } catch (err) { res.status(500).json(err); }
});

app.post('/courses', async(req, res) => {
    try {
        const { title, backdrop, type } = req.body;
        const newId = Math.random().toString(36).substr(2, 9);
        await query("INSERT INTO courses (id, title, backdrop, type) VALUES (?, ?, ?, ?)", [newId, title, backdrop, type]);
        res.json({ id: newId, title, backdrop, type });
    } catch (err) { res.status(500).json(err); }
});

app.patch('/courses/:id', async(req, res) => {
    try {
        const { title, backdrop, type } = req.body;
        let fields = [],
            values = [];
        if (title) {
            fields.push("title = ?");
            values.push(title);
        }
        if (backdrop) {
            fields.push("backdrop = ?");
            values.push(backdrop);
        }
        if (type) {
            fields.push("type = ?");
            values.push(type);
        }

        values.push(req.params.id);
        await query(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`, values);
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json(err); }
});

app.delete('/courses/:id', async(req, res) => {
    try {
        await query("DELETE FROM courses WHERE id = ?", [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json(err); }
});

// =============================================================
// PHẦN 3: API SESSIONS (Chương học)
// =============================================================

// GET /sessions?courseId=... (Lọc theo khóa học)
app.get('/sessions', async(req, res) => {
    try {
        let sql = "SELECT * FROM sessions";
        let params = [];
        if (req.query.courseId) {
            sql += " WHERE courseId = ?";
            params.push(req.query.courseId);
        }
        const data = await query(sql, params);
        res.json(data);
    } catch (err) { res.status(500).json(err); }
});

app.post('/sessions', async(req, res) => {
    try {
        const { courseId, title } = req.body;
        const newId = Math.random().toString(36).substr(2, 9);
        await query("INSERT INTO sessions (id, courseId, title) VALUES (?, ?, ?)", [newId, courseId, title]);
        res.json({ id: newId, courseId, title });
    } catch (err) { res.status(500).json(err); }
});

app.delete('/sessions/:id', async(req, res) => {
    try {
        await query("DELETE FROM sessions WHERE id = ?", [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json(err); }
});

// =============================================================
// PHẦN 4: API LESSONS (Bài học)
// =============================================================

app.get('/lessons', async(req, res) => {
    try {
        const data = await query("SELECT * FROM lessons");
        res.json(data);
    } catch (err) { res.status(500).json(err); }
});

app.post('/lessons', async(req, res) => {
    try {
        const { sessionId, title, content } = req.body;
        const newId = Math.random().toString(36).substr(2, 9);
        await query("INSERT INTO lessons (id, sessionId, title, content) VALUES (?, ?, ?, ?)", [newId, sessionId, title, content || '']);
        res.json({ id: newId, sessionId, title, content });
    } catch (err) { res.status(500).json(err); }
});

// PATCH lesson (Update nội dung hoặc di chuyển sang session khác)
app.patch('/lessons/:id', async(req, res) => {
    try {
        const { sessionId, title, content, status } = req.body;
        let fields = [],
            values = [];
        if (sessionId) {
            fields.push("sessionId = ?");
            values.push(sessionId);
        }
        if (title) {
            fields.push("title = ?");
            values.push(title);
        }
        if (content !== undefined) {
            fields.push("content = ?");
            values.push(content);
        }

        values.push(req.params.id);

        if (fields.length > 0) {
            await query(`UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`, values);
        }
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json(err); }
});

app.delete('/lessons/:id', async(req, res) => {
    try {
        await query("DELETE FROM lessons WHERE id = ?", [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json(err); }
});

// =============================================================
// PHẦN 5: API QUESTIONS (Câu hỏi trắc nghiệm)
// =============================================================

app.get('/questions', async(req, res) => {
    try {
        const questions = await query("SELECT * FROM questions");
        const formattedQuestions = questions.map(q => ({
            ...q,
            // Parse options từ JSON string thành Array
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));
        res.json(formattedQuestions);
    } catch (error) {
        res.status(500).json(error);
    }
});

// =============================================================
// KHỞI ĐỘNG SERVER
// =============================================================
app.listen(PORT, () => {
    console.log(`🚀 Server Node.js đang chạy tại: http://localhost:${PORT}`);
});