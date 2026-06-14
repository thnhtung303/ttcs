import React, { useState, useEffect } from "react";

const Products = ({ loggedInUser }) => {
  const isAdmin = loggedInUser?.role === "admin";
  const userWarehouse = loggedInUser?.warehouse_id || ""; 

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [selected_warehouse, setSelectedWarehouse] = useState(isAdmin ? "" : userWarehouse);
  const [expandedProductId, setExpandedProductId] = useState(null);

  // Form States
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost_price, setCostPrice] = useState(0); 
  const [status, setStatus] = useState({ msg: "", type: "" });

  const loadInitialData = async () => {
    const headers = { "Authorization": `Bearer ${localStorage.getItem("token")}` };
    try {
      const resProd = await fetch("http://localhost:8081/api/product/list", { headers });
      if (resProd.ok) setProducts(await resProd.json());

      const resWh = await fetch("http://localhost:8081/api/warehouse/list", { headers });
      if (resWh.ok) {
        const whData = await resWh.json();
        setWarehouses(whData);
        if (isAdmin && !selected_warehouse && whData.length > 0) {
          setSelectedWarehouse(whData[0]._id);
        }
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadInitialData(); }, [selected_warehouse]);

  const displayedProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true; 
    return p.name?.toLowerCase().includes(query);
  });

  const HandleAddProduct = async () => {
    if (!name.trim()) { setStatus({ msg: "Vui lòng nhập tên thiết bị!", type: "danger" }); return; }
    setStatus({ msg: "Đang xử lý...", type: "info" });
    try {
      const res = await fetch("http://localhost:8081/api/product/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ name, description, cost_price: Number(cost_price) })
      });
      if (res.ok) {
        setStatus({ msg: "Thêm thiết bị mới thành công!", type: "success" });
        setName(""); setDescription(""); setCostPrice(0); loadInitialData();
      }
    } catch (err) { setStatus({ msg: "Lỗi máy chủ!", type: "danger" }); }
  };

  const HandleEditProduct = async () => {
    if (!name.trim()) { setStatus({ msg: "Tên không được để trống!", type: "danger" }); return; }
    setStatus({ msg: "Đang cập nhật...", type: "info" });
    try {
      const res = await fetch(`http://localhost:8081/api/product/update/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ name, description, cost_price: Number(cost_price) })
      });
      if (res.ok) {
        setStatus({ msg: "Cập nhật thành công!", type: "success" });
        setEditingId(null); setName(""); setDescription(""); setCostPrice(0); loadInitialData();
      }
    } catch (err) { setStatus({ msg: "Lỗi máy chủ!", type: "danger" }); }
  };

  const HandleDeleteProduct = async (id) => {
    if (!window.confirm("Xóa thiết bị này khỏi danh mục?")) return;
    try {
      const res = await fetch(`http://localhost:8081/api/product/delete/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) { setStatus({ msg: "Xóa thành công!", type: "success" }); loadInitialData(); }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
      <div className="card">
        <h2 className="card__title">{editingId ? "📝 Sửa sản phẩm" : "➕ Thêm sản phẩm"}</h2>
        {status.msg && <div className={`flash ${status.type}`}>{status.msg}</div>}
        <div className="form-grid">
          <label>Tên thiết bị:</label>
          <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} />
          
          <label>Giá nhập:</label>
          <input type="number" className="input" value={cost_price} onChange={(e) => setCostPrice(e.target.value)} min="0" />

          <label>Mô tả:</label>
          <textarea className="input" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} />
          
          <div className="form-actions" style={{ marginTop: "10px" }}>
            {editingId ? (
              <button type="button" className="btn" onClick={HandleEditProduct}>💾 Cập nhật</button>
            ) : (
              <button type="button" className="btn" onClick={HandleAddProduct}>➕ Thêm</button>
            )}
            {editingId && <button type="button" className="btn ghost" onClick={() => { setEditingId(null); setName(""); setDescription(""); setCostPrice(0); }}>Hủy bỏ</button>}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card__title">📦 Danh sách mặt hàng tồn kho</h2>
        <div className="toolbar" style={{ gap: "12px", flexWrap: "wrap" }}>
          {isAdmin && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontWeight: "600" }}>Xem theo kho:</label>
              <select className="input" value={selected_warehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}>
                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
          )}
          <input type="text" className="input" style={{ width: "200px" }} placeholder="Tìm theo tên thiết bị..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="table-wrapper" style={{ marginTop: "15px" }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: "55%" }}>Tên Sản phẩm</th>
                <th style={{ width: "25%", textAlign: "center" }}>Số lượng</th>
                <th style={{ width: "20%", textAlign: "center" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((p) => {
                const currentStockConfig = p.stock?.find(st => st.warehouse_id?.toString() === selected_warehouse?.toString());
                const currentQty = currentStockConfig ? currentStockConfig.quantity : 0;
                const isLowStock = currentStockConfig ? (currentQty <= currentStockConfig.low_stock) : false;
                const isExpanded = expandedProductId === p._id;

                return (
                  <React.Fragment key={p._id}>
                    <tr onClick={() => setExpandedProductId(isExpanded ? null : p._id)} style={{ cursor: "pointer" }}>
                      <td style={{ fontWeight: "600" }}>{isExpanded ? "📂 " : "📁 "} {p.name}</td>
                      <td style={{ textAlign: "center" }}>
                        <strong style={{ color: isLowStock ? "var(--bad)" : "var(--ok)" }}>{currentQty} cái</strong>
                      </td>
                      <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                        <div className="row-actions" style={{ justifyContent: "center", gap: "6px" }}>
                          <button className="btn small" onClick={() => { setEditingId(p._id); setName(p.name); setDescription(p.description || ""); setCostPrice(p.cost_price || 0); setStatus({ msg: "", type: "" }); }}>Sửa</button>
                          {isAdmin && <button className="btn danger small" onClick={() => HandleDeleteProduct(p._id)}>Xóa</button>}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={3} style={{ padding: "14px 20px", backgroundColor: "color-mix(in oklab, var(--border) 20%, transparent)" }}>
                          <div style={{ marginBottom: "6px" }}><strong>Giá nhập:</strong> {(p.cost_price || 0).toLocaleString()} VND</div>
                          <div style={{ whiteSpace: "pre-line", color: "var(--muted)" }}><strong>Mô tả:</strong> {p.description || "Chưa có cấu hình chi tiết."}</div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;