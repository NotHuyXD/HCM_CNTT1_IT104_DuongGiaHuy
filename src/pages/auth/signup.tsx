/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { type FormEvent, useState } from "react";
import { Link } from "react-router";
import "./auth.css";
import { Apis } from "../../apis";

export default function SignUp() {
  const [error, setError] = useState<string>("");

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setError(""); // reset lỗi cũ

    const email = (e.target as any).email.value.trim();
    const username = (e.target as any).username.value.trim();
    const password = (e.target as any).password.value.trim();

    // ✅ Kiểm tra bỏ trống
    if (!email || !username || !password) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // ✅ Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ!");
      return;
    }

    try {
      const result = await Apis.user.signUp({ username, email, password });
      alert("🎉 Chúc mừng " + result.username + " đăng ký thành công!");
      (e.target as HTMLFormElement).reset(); // Xoá form sau khi đăng ký
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi đăng ký!");
    }
  }

  return (
    <div id="signUp">
      <img src="../src/imgs/AuthTrello.png" alt="Auth" />
      <form className="auth" onSubmit={handleSignUp}>
        <p>Please sign up</p>

        <input type="text" name="email" placeholder="Email address" />
        <input type="text" name="username" placeholder="Username" />
        <input type="password" name="password" placeholder="Password" />

        {/* Thông báo lỗi */}
        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

        <p>
          Already have an account? <Link to="/">Click here!</Link>
        </p>
        <button type="submit">Đăng Ký</button>
      </form>
      <p>&copy; 2025 - Rikkei Education</p>
    </div>
  );
}
