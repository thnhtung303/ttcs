import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const TopBar = ({ loggedInUser, setLoggedInUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedInUser(null);
    navigate("/login");
  };

  const isAtDashboard = location.pathname === "/dashboard" || location.pathname === "/login" || location.pathname === "/";
  const brandText = isAtDashboard ? "KHO HÀNG THÔNG MINH" : "🏠 VỂ TRANG CHỦ";

  return (
    <div className="topbar">
      <div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="brand">
          <Link to="/dashboard">{brandText}</Link>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button type="button" className="theme-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
          
          {loggedInUser && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span>
                Xin chào, <strong>{loggedInUser.name}</strong> {/* KHỚP THUỘC TÍNH .name MỚI */}
                <span style={{ fontSize: "0.85rem", color: "var(--muted)", marginLeft: "6px" }}>
                  ({loggedInUser.role === "admin" ? "Quản lý" : "Nhân viên"})
                </span>
              </span>
              <button type="button" className="btn danger small" style={{cursor: "pointer"}} onClick={handleLogout}>Đăng xuất</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;