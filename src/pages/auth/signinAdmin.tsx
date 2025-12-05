/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, type FormEvent } from "react";
import "./auth.css";
import { Apis } from "../../apis";
import { useSelector } from "react-redux";
import type { StoreType } from "../../stores";

export default function SignInAdmin() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    const email = (e.target as any).email.value.trim();
    const password = (e.target as any).password.value.trim();

    if (!email || !password) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ thông tin!" });
      return;
    }

    try {
      const data = { email, password };
      const result = await Apis.user.signInAdmin(data);
      localStorage.setItem("token", result);

      setMessage({ type: "success", text: "Đăng nhập Admin thành công!" });

      setTimeout(() => { window.location.href = "/admin"; }, 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Truy cập bị từ chối!" });
    }

    setTimeout(() => setMessage(null), 3000);
  }

  const userStore = useSelector((store: StoreType) => store.user);

  useEffect(() => {
    if (!userStore.loading && userStore.data && userStore.data.role === "admin") {
      window.location.href = "/admin";
    }
  }, [userStore.data, userStore.loading]);

  return (
    <div className="auth-page">
      {/* Backdrop Admin: Dùng ảnh khác để phân biệt */}
      <div className="auth-backdrop" style={{backgroundImage: "url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop')"}}>
        <div className="backdrop-content">
          <h2>Quản trị hệ thống</h2>
          <p>Truy cập dành riêng cho quản trị viên Learn-Hub.</p>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-logo" style={{color: '#dc2626'}}>Learn-Hub Admin</div>
        <p className="auth-subtitle">Cổng đăng nhập quản trị</p>

        {message && (
          <div className={`alert ${message.type}`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)}>×</button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSignIn}>
          <div className="input-group">
            <label>Email quản trị</label>
            <input className="auth-input" type="text" name="email" placeholder="admin@learnhub.com" />
          </div>
          
          <div className="input-group">
            <label>Mật khẩu</label>
            <input className="auth-input" type="password" name="password" placeholder="Nhập mật khẩu" />
          </div>

          <button className="auth-btn" type="submit" style={{backgroundColor: '#dc2626'}}>Đăng Nhập Admin</button>
        </form>

        <p className="copyright">&copy; 2025 - Learn-Hub System</p>
      </div>
    </div>
  );
}