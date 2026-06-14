import React, { useState, useEffect } from "react";

const Stock = ({ loggedInUser }) => {
  const isAdmin = loggedInUser?.role === "admin";
  const userWarehouse = loggedInUser?.warehouse_id || ""; 

  const [warehouses, setWarehouses] = useState([]);
  const [selected_warehouse, setSelectedWarehouse] = useState(isAdmin ? "ALL" : userWarehouse);
  const [stockRecords, setStockRecords] = useState([]);
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [status, setStatus] = useState({ msg: "", type: "" });

  useEffect(() => {
    if (isAdmin) {
      fetch("http://localhost:8081/api/warehouse/list", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => res.json()).then(data => setWarehouses(data));
    }
  }, [isAdmin]);

  const loadStockData = async () => {
    if (!selected_warehouse) return;
    const queryParams = new URLSearchParams({ warehouse_id: selected_warehouse }).toString();
    try {
      const res = await fetch(`http://localhost:8081/api/product/stock?${queryParams}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) setStockRecords(await res.json());
    } catch (err) { setStatus({ msg: "Lỗi kết nối kiểm kê!", type: "danger" }); }
  };

  useEffect(() => { loadStockData(); }, [selected_warehouse]);

  const displayedRecords = stockRecords.filter(item => {
    if (!filterLowStock) return true;
    return item.current_stock <= item.low_stock; 
  });

  return (
    <div className="card">
      <h2 className="card__title">🔍 Kiểm kê & Cảnh báo tồn kho thiết bị</h2>
      {status.msg && <div className={`flash ${status.type}`}>{status.msg}</div>}
      
      <div className="toolbar" style={{ gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
        <label style={{ fontWeight: "600" }}>Vị trí kiểm tra:</label>
        {isAdmin ? (
          <select className="input" value={selected_warehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}>
            <option value="ALL">—— Tất cả các chi nhánh ——</option>
            {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>
        ) : (
          <input type="text" className="input" style={{ width: "220px", fontWeight: "bold" }} value="Kho trực thuộc đang làm việc" disabled />
        )}
        <span className="spacer"></span>
        <button type="button" className={`btn ${!filterLowStock ? "" : "ghost"}`} onClick={() => setFilterLowStock(false)}>📋 Tất cả</button>
        <button type="button" className={`btn danger ${filterLowStock ? "" : "ghost"}`} onClick={() => setFilterLowStock(true)}>⚠️ Tồn kho thấp</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: "45%" }}>Tên Sản phẩm</th>
              <th style={{ width: "20%", textAlign: "center" }}>Số lượng tồn</th>
              <th style={{ width: "20%", textAlign: "center" }}>Ngưỡng cảnh báo</th>
              <th style={{ width: "15%" }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {displayedRecords.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>
                  Không tìm thấy thiết bị nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              displayedRecords.map((rec, idx) => {
                // ✅ ĐÃ SỬA: Tính toán nguy cơ dựa trên rec.current_stock gạch dưới
                const isDanger = rec.current_stock <= rec.low_stock; 
                return (
                  <tr key={idx} style={{ background: isDanger ? "color-mix(in oklab, var(--bad) 6%, transparent)" : "transparent" }}>
                    <td style={{ fontWeight: "600" }}>{rec.product_name}</td>
                    
                    {/* ✅ ĐÃ SỬA: Gọi đúng thuộc tính rec.current_stock để in con số ra màn hình */}
                    <td style={{ textAlign: "center", fontWeight: "700", color: isDanger ? "var(--bad)" : "var(--ok)", fontSize: "1.05rem" }}>
                      {rec.current_stock} cái
                    </td>
                    
                    <td style={{ textAlign: "center" }}>{rec.low_stock} cái</td>
                    <td>
                      {isDanger ? (
                        <span className="chip" style={{ backgroundColor: "var(--bad)", color: "#fff" }}>Cần nhập gấp</span>
                      ) : (
                        <span className="chip" style={{ backgroundColor: "var(--ok)", color: "#fff" }}>An toàn</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stock;