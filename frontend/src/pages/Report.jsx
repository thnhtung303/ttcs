import React, { useState, useEffect } from "react";

const Report = ({ loggedInUser }) => {
  const isAdmin = loggedInUser?.role === "admin";
  const userWarehouse = loggedInUser?.warehouse_id || ""; 

  const [warehouses, setWarehouses] = useState([]);
  const [selected_warehouse, setSelectedWarehouse] = useState(isAdmin ? "ALL" : userWarehouse);
  const [filter_type, setFilterType] = useState("month"); 

  // State quản lý Tab đang được chọn. Mặc định là 'sales' (Doanh số)
  // Các giá trị: 'sales' | 'customers' | 'products'
  const [activeTab, setActiveTab] = useState("sales");

  // Bộ lưu trữ dữ liệu từ API
  const [trendData, setTrendData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  // 1. Tải danh mục kho cho Admin
  useEffect(() => {
    if (isAdmin) {
      fetch("http://localhost:8081/api/warehouse/list", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => res.json())
      .then(data => setWarehouses(data))
      .catch(err => console.error(err));
    }
  }, [isAdmin]);

  // 2. Tải số liệu thống kê tổng hợp từ Backend
  const loadReportData = async () => {
    if (!selected_warehouse) return;
    const query = new URLSearchParams({
      warehouse_id: selected_warehouse,
      filter_type: filter_type
    }).toString();

    try {
      const res = await fetch(`http://localhost:8081/api/report/stats?${query}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const json = await res.json();
        setTrendData(json.trend || []);
        setTopProducts(json.products || []);
        setTopCustomers(json.customers || []);
      }
    } catch (err) {
      console.error("Lỗi kết nối trung tâm phân tích:", err);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [selected_warehouse, filter_type]);

  return (
    <div className="report-page">
      {/* BANNER GRADIENT CHUẨN GIAO DIỆN HỆ THỐNG */}
      <div className="header" style={{ background: "linear-gradient(135deg, #3b82f6, #10b981)", padding: "25px", borderRadius: "12px", color: "#fff", textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "1px", marginBottom: "6px" }}>THỐNG KÊ</h1>
        <p style={{ opacity: 0.9, fontSize: "0.95rem" }}>Hệ thống quản lý kho hàng</p>
      </div>

      {/* THANH BỘ LỌC TỔNG CỦA TRANG */}
      <div className="card" style={{ padding: "15px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontWeight: "600" }}>Kho thống kê:</label>
            {isAdmin ? (
              <select className="input" style={{ width: "auto", minWidth: "160px" }} value={selected_warehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}>
                <option value="ALL">Tất cả các kho hàng</option>
                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            ) : (
              <input type="text" className="input" style={{ width: "200px", fontWeight: "bold" }} value="Kho trực thuộc quản lý" disabled />
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontWeight: "600" }}>Thời gian:</label>
            <select className="input" style={{ width: "auto" }} value={filter_type} onChange={(e) => setFilterType(e.target.value)}>
              <option value="day">Thống kê theo Ngày</option>
              <option value="month">Thống kê theo Tháng</option>
              <option value="year">Thống kê theo Năm</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= THANH ĐIỀU HƯỚNG DANH MỤC TAB ================= */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", borderBottom: "2px solid var(--border)", paddingBottom: "10px" }}>
        <button 
          type="button" 
          className={`btn ${activeTab === "sales" ? "" : "ghost"}`} 
          style={{ padding: "10px 20px", fontWeight: "600" }}
          onClick={() => setActiveTab("sales")}
        >
          💰 Thống kê doanh số
        </button>
        <button 
          type="button" 
          className={`btn ${activeTab === "customers" ? "" : "ghost"}`} 
          style={{ padding: "10px 20px", fontWeight: "600" }}
          onClick={() => setActiveTab("customers")}
        >
          👑 Khách hàng mua nhiều
        </button>
        <button 
          type="button" 
          className={`btn ${activeTab === "products" ? "" : "ghost"}`} 
          style={{ padding: "10px 20px", fontWeight: "600" }}
          onClick={() => setActiveTab("products")}
        >
          🏆 Mặt hàng bán chạy
        </button>
      </div>

      {/* ================= KHU VỰC HIỂN THỊ CHI TIẾT THEO TAB ĐANG CHỌN ================= */}
      <div className="card" style={{ padding: "24px" }}>
        
        {/* TAB 1: CHI TIẾT DOANH SỐ */}
        {activeTab === "sales" && (
          <div>
            <h3 style={{ marginBottom: "15px", color: "var(--brand)", fontWeight: "700" }}>📊 Bảng kê Biến động Doanh thu & Lợi nhuận</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Mốc chu kỳ thời gian</th>
                    <th style={{ textAlign: "right" }}>Tổng doanh thu bán hàng</th>
                    <th style={{ textAlign: "right" }}>Lợi nhuận gộp ước tính</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>Chưa ghi nhận dữ liệu doanh số.</td>
                    </tr>
                  ) : (
                    trendData.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: "600" }}>{row._id}</td>
                        <td style={{ textAlign: "right", color: "var(--brand)", fontWeight: "700" }}>{(row.total_revenue || 0).toLocaleString()} VND</td>
                        <td style={{ textAlign: "right", color: "var(--ok)", fontWeight: "700" }}>{(row.total_profit || 0).toLocaleString()} VND</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/*  CHI TIẾT KHÁCH HÀNG MUA NHIỀU */}
        {activeTab === "customers" && (
          <div>
            <h3 style={{ marginBottom: "15px", color: "#f59e0b", fontWeight: "700" }}>Danh sách khách hàng mua nhiều:</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "15%", textAlign: "center" }}>STT</th>
                    <th>Họ tên khách hàng / Đối tác</th>
                    <th style={{ textAlign: "right", width: "40%" }}>Tổng giá trị tích lũy đơn mua</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>Chưa có dữ liệu khách hàng.</td>
                    </tr>
                  ) : (
                    topCustomers.map((c, i) => (
                      <tr key={i}>
                        <td style={{ textAlign: "center", fontWeight: "bold", color: "var(--muted)" }}>#{i + 1}</td>
                        <td style={{ fontWeight: "600" }}>{c.customer_name || "Khách hàng ẩn danh"}</td>
                        <td style={{ textAlign: "right", color: "var(--brand)", fontWeight: "700" }}>{(c.total_spent || 0).toLocaleString()} VND</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CHI TIẾT MẶT HÀNG BÁN NHIỀU */}
        {activeTab === "products" && (
          <div>
            <h3 style={{ marginBottom: "15px", color: "var(--ok)", fontWeight: "700" }}>Danh sách sản phẩm bán chạy:</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "12%", textAlign: "center" }}>STT</th>
                    <th>Tên thiết bị điện tử</th>
                    <th style={{ textAlign: "center", width: "25%" }}>Tổng số lượng đã bán</th>
                    <th style={{ textAlign: "right", width: "30%" }}>Tổng lợi nhuận đem lại</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>Chưa có dữ liệu sản phẩm tiêu thụ.</td>
                    </tr>
                  ) : (
                    topProducts.map((p, i) => (
                      <tr key={i}>
                        <td style={{ textAlign: "center", fontWeight: "bold", color: "var(--muted)" }}>#{i + 1}</td>
                        <td style={{ fontWeight: "600" }}>{p.product_name || "Thiết bị hệ thống"}</td>
                        <td style={{ textAlign: "center", fontWeight: "600" }}>{p.total_qty} cái</td>
                        <td style={{ textAlign: "right", color: "var(--ok)", fontWeight: "700" }}>{(p.profit || 0).toLocaleString()} VND</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Report;