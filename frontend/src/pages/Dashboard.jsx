import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Dashboard = ({ loggedInUser }) => {
  const isAdmin = loggedInUser?.role === "admin";
  const userWarehouse = loggedInUser?.warehouse_id || ""; 
  
  const [summary, setSummary] = useState({ total_revenue: 0, total_profit: 0, total_products: 0, low_stock_count: 0 });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams();
        params.append("warehouse_id", isAdmin ? "ALL" : userWarehouse);

        const res = await fetch(`http://localhost:8081/api/dashboard/summary?${params.toString()}`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        
        if (res.ok) {
          const json = await res.json();
          setSummary(json.data || { total_revenue: 0, total_profit: 0, total_products: 0, low_stock_count: 0 });
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin tổng quan:", err);
      }
    };
    fetchSummary();
  }, [isAdmin, userWarehouse]);

  return (
    <div className="dashboard">
      <div className="header">
        <h1>TRANG CHỦ</h1>
        <p>Hệ thống quản lý kho hàng</p>
      </div>

      <div className="top-row">
        <div className="card stat">
          <div className="icon">💰</div>
          <div className="label">Tổng doanh thu</div>
          <div className="value" style={{ background: "linear-gradient(90deg, #3b82f6, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {(summary.total_revenue || 0).toLocaleString()} VND
          </div>
        </div>

        <div className="card stat" >
          <div className="icon">📈</div>
          <div className="label">Tổng lợi nhuận</div>
          <div className="value" style={{ background: "linear-gradient(90deg, #10b981, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {(summary.total_profit || 0).toLocaleString()} VND
          </div>
        </div>

        <div className="card stat" style={{cursor:"pointer"}}>
          <div className="icon">📦</div>
          <div className="label">Tổng danh mục hàng</div>
          <div className="value" style={{ background: "linear-gradient(90deg, #3b82f6, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {summary.total_products || 0}
          </div>
        </div>

        <div className="card stat" style={{ borderLeft: "4px solid var(--bad)", cursor:"pointer" }}>
          <div className="icon">📉</div>
          <div className="label">Mặt hàng tồn kho thấp</div>
          <div className="value" style={{ background: "linear-gradient(90deg, var(--bad), #f87171)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {summary.low_stock_count || 0}
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: "20px", color: "var(--brand)", fontSize: "1.5rem" }}>⚡ Nghiệp vụ xử lý nhanh</h2>
      <div className="actions">
        <div className="action-row">
          <Link to="/import" className="action">
            <h3>📥 Nhập hàng</h3>
            <p>Thêm sản phẩm từ nhà cung cấp vào kho hàng.</p>
          </Link>
          <Link to="/export" className="action">
            <h3>📤 Xuất hàng</h3>
            <p>Xuất kho bán hàng cho khách hàng.</p>
          </Link>
          <Link to="/stock" className="action">
            <h3>📉 Kiểm tra tồn kho</h3>
            <p>Xem chi tiết số lượng tồn kho và các mặt hàng cần nhập ngay.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;