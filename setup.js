import mysql from 'mysql2';

// 1. Kết nối vào MySQL mà KHÔNG chọn database cụ thể
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'huy0965507655' // <--- Đảm bảo mật khẩu đúng
});

db.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối MySQL:', err);
        return;
    }
    console.log('✅ Đã vào được MySQL Server!');

    // 2. Chạy lệnh tạo Database bằng code
    db.query("CREATE DATABASE IF NOT EXISTS my_elearning_db", (err, result) => {
        if (err) {
            console.error('Lỗi tạo DB:', err);
        } else {
            console.log('✅ Đã tạo (hoặc tìm thấy) database: my_elearning_db');
        }

        // 3. Kết thúc
        db.end();
    });
});