import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setLoggedInUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setLoggedInUser(data.user);
        navigate("/dashboard");
      } else {
        setError(data.message || "Sai tài khoản hoặc mật khẩu");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
      <div className="card" style={{ width: "400px" }}>
        <h2 className="card__title" style={{ textAlign: "center" }}>Đăng nhập</h2>
        {error && <div className="flash danger">{error}</div>}
        
        <form onSubmit={handleLogin} className="form-grid">
          <label>Tài khoản:</label>
          <input style={{width: "100%"}} type="text" className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <label>Mật khẩu:</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div className="form-actions" style={{ marginTop: "15px" }}>
            <button type="submit" className="btn" style={{ width: "100%", cursor: "pointer" }}>Đăng nhập</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;