/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router"; // Lưu ý: bản react-router mới dùng 'react-router', cũ dùng 'react-router-dom'
import "./auth.css";
import { Apis } from "../../apis";
import { useSelector } from "react-redux";
import type { StoreType } from "../../stores";

export default function SignIn() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    const email = (e.target as any).email.value.trim();
    const password = (e.target as any).password.value.trim();

    if (!email || !password) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ Email và Mật khẩu!" });
      return;
    }

    try {
      const data = { email, password };
      const result = await Apis.user.signIn(data);
      localStorage.setItem("token", result);

      setMessage({ type: "success", text: "Đăng nhập thành công! Đang chuyển hướng..." });

      setTimeout(() => { window.location.href = "/home"; }, 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Email hoặc mật khẩu không chính xác!" });
    }

    setTimeout(() => setMessage(null), 3000);
  }

  const userStore = useSelector((store: StoreType) => store.user);

  useEffect(() => {
    if (!userStore.loading && userStore.data && userStore.data.role !== "admin") {
      window.location.href = "/home";
    }
  }, [userStore.data, userStore.loading]);

  return (
    <div className="auth-page">
      {/* Cột Trái: Backdrop */}
      <div className="auth-backdrop">
        <div className="backdrop-content">
          <h2>Học tập không giới hạn.</h2>
          <p>Tham gia cộng đồng Learn-Hub ngay hôm nay để mở rộng kiến thức và phát triển kỹ năng của bạn.</p>
        </div>
      </div>

      {/* Cột Phải: Form */}
      <div className="auth-form-section">
        {/* Logo Text thay vì Ảnh */}
        <div className="auth-logo">Learn-Hub.</div>
        <p className="auth-subtitle">Chào mừng bạn quay trở lại!</p>

        {/* Alert Message */}
        {message && (
          <div className={`alert ${message.type}`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)}>×</button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSignIn}>
          <div className="input-group">
            <label>Email</label>
            <input className="auth-input" type="text" name="email" placeholder="Nhập địa chỉ email của bạn" />
          </div>
          
          <div className="input-group">
            <label>Mật khẩu</label>
            <input className="auth-input" type="password" name="password" placeholder="Nhập mật khẩu" />
          </div>

          <button className="auth-btn" type="submit">Đăng Nhập</button>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
        </div>

        <p className="copyright">&copy; 2025 - Learn-Hub Education</p>
      </div>
    </div>
  );
}