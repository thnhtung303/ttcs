import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ loggedInUser }) => {
  return (
    <div className="sidebar">
      <NavLink to="/dashboard" className={({ isActive }) => `nav__item ${isActive ? "active" : ""}`}>🏠 Trang chủ</NavLink>
      <NavLink to="/report" className={({ isActive }) => `nav__item ${isActive ? "active" : ""}`}>📊 Thống kê</NavLink>
      <NavLink to="/products" className={({ isActive }) => `nav__item ${isActive ? "active" : ""}`}>📦 Hàng hoá</NavLink>
      <NavLink to="/stock" className={({ isActive }) => `nav__item ${isActive ? "active" : ""}`}>📉 Tồn kho</NavLink>
      <NavLink to="/import" className={({ isActive }) => `nav__item ${isActive ? "active" : ""}`}>📥 Nhập Hàng</NavLink>
      <NavLink to="/export" className={({ isActive }) => `nav__item ${isActive ? "active" : ""}`}>📤 Xuất Hàng</NavLink>
      <NavLink to="/customer" className={({ isActive }) => `nav__item ${isActive ? "active" : ""}`}>👥 Khách hàng</NavLink>
      <NavLink to="/supplier" className={({ isActive }) => `nav__item ${isActive ? "active" : ""}`}>🏢 Nhà cung cấp</NavLink>
    </div>
  );
};

export default Sidebar;