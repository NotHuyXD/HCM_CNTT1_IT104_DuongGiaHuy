/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { type FormEvent, useState } from "react";
import { Link } from "react-router";
import "./auth.css";
import { Apis } from "../../apis";

export default function SignUp() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    const email = (e.target as any).email.value.trim();
    const username = (e.target as any).username.value.trim();
    const password = (e.target as any).password.value.trim();
    const role = "user";

    if (!email || !username || !password) {
      setMessage({ type: "error", text: "Vui lòng điền đầy đủ thông tin!" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: "Email không hợp lệ!" });
      return;
    }

    try {
      const result = await Apis.user.signUp({ username, email, password, role });
      setMessage({ type: "success", text: `🎉 Chúc mừng ${result.username}, đăng ký thành công!` });
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Đã xảy ra lỗi khi đăng ký!" });
    }
  }

  return (
    <div className="auth-page">
      {/* Cột Trái: Backdrop */}
      <div className="auth-backdrop" style={{backgroundImage: "url('https://images.unsplash.com/photo-1513258496098-882605922721?q=80&w=2070&auto=format&fit=crop')"}}>
        <div className="backdrop-content">
          <h2>Bắt đầu hành trình mới.</h2>
          <p>Tạo tài khoản Learn-Hub miễn phí và truy cập kho tàng tri thức khổng lồ.</p>
        </div>
      </div>

      {/* Cột Phải: Form */}
      <div className="auth-form-section">
        <div className="auth-logo">Learn-Hub.</div>
        <p className="auth-subtitle">Tạo tài khoản mới</p>

        {message && (
          <div className={`alert ${message.type}`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)}>×</button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSignUp}>
          <div className="input-group">
            <label>Email</label>
            <input className="auth-input" type="text" name="email" placeholder="name@example.com" />
          </div>

          <div className="input-group">
            <label>Tên người dùng</label>
            <input className="auth-input" type="text" name="username" placeholder="Ví dụ: NguyenVanA" />
          </div>
          
          <div className="input-group">
            <label>Mật khẩu</label>
            <input className="auth-input" type="password" name="password" placeholder="Tạo mật khẩu mạnh" />
          </div>

          <button className="auth-btn" type="submit">Đăng Ký</button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản? <Link to="/">Đăng nhập tại đây</Link>
        </div>

        <p className="copyright">&copy; 2025 - Learn-Hub Education</p>
      </div>
    </div>
  );
}