/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
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

    // Validate email và password
    if (!email || !password) {
      setMessage({
        type: "error",
        text: "Email và mật khẩu không được bỏ trống!",
      });
      return;
    }

    // Regex kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({
        type: "error",
        text: "Email không đúng định dạng!",
      });
      return;
    }

    try {
      const data = { email, password };
      const result = await Apis.user.signIn(data);
      localStorage.setItem("token", result);

      setMessage({
        type: "success",
        text: "Đăng nhập thành công!",
      });

      // Sau 1.5s chuyển hướng sang /home
      setTimeout(() => {
        window.location.href = "/home";
      }, 1500);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Đăng nhập thất bại!",
      });
    }

    // Ẩn thông báo sau 3 giây
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  }

  const userStore = useSelector((store: StoreType) => store.user);

  useEffect(() => {
    if (!userStore.loading && userStore.data) {
      window.location.href = "/home";
    }
  }, [userStore.data, userStore.loading]);

  return (
    <div id="signIn">
      <img src="../src/imgs/AuthTrello.png" alt="auth-logo" />

      {/* Thông báo */}
      {message && (
        <div className={`alert ${message.type}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      <form className="auth" onSubmit={handleSignIn}>
        <p>Please sign in</p>
        <input type="text" name="email" placeholder="Email address" />
        <input type="password" name="password" placeholder="Password" />
        <p>
          Don't have an account? <Link to="/signup">click here!</Link>
        </p>
        <button type="submit">Đăng Nhập</button>
      </form>

      <p>&copy; 2025 - Rikkei Education</p>
    </div>
  );
}
