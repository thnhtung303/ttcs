import React, { useState, useEffect } from "react";

const Supplier = ({ loggedInUser }) => {
  const isAdmin = loggedInUser?.role === "admin";

  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State chạy Live Search tự động

  // Form States
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState({ msg: "", type: "" });

  const loadSuppliers = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/supplier/list", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) setSuppliers(await res.json());
    } catch (err) {
      console.error("Lỗi tải danh sách nhà cung cấp:", err);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const displayedSuppliers = suppliers.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return s.name?.toLowerCase().includes(query);
  });

  const HandleAddSupplier = async () => {
    if (!name.trim()) { setStatus({ msg: "Vui lòng nhập tên nhà cung cấp!", type: "danger" }); return; }
    setStatus({ msg: "Đang xử lý...", type: "info" });
    try {
      const res = await fetch("http://localhost:8081/api/supplier/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ name, phone, email, address })
      });
      if (res.ok) {
        setStatus({ msg: "Thêm nhà cung cấp thành công!", type: "success" });
        setName(""); setPhone(""); setEmail(""); setAddress(""); loadSuppliers();
      }
    } catch (err) { setStatus({ msg: "Lỗi máy chủ!", type: "danger" }); }
  };

  const HandleEditSupplier = async () => {
    if (!name.trim()) { setStatus({ msg: "Tên không được để trống!", type: "danger" }); return; }
    setStatus({ msg: "Đang cập nhật...", type: "info" });
    try {
      const res = await fetch(`http://localhost:8081/api/supplier/update/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ name, phone, email, address })
      });
      if (res.ok) {
        setStatus({ msg: "Cập nhật đối tác thành công!", type: "success" });
        setEditingId(null); setName(""); setPhone(""); setEmail(""); setAddress(""); loadSuppliers();
      }
    } catch (err) { setStatus({ msg: "Lỗi máy chủ!", type: "danger" }); }
  };

  const HandleDeleteSupplier = async (id) => {
    if (!window.confirm("Xóa nhà cung cấp này khỏi hệ thống đối tác?")) return;
    try {
      const res = await fetch(`http://localhost:8081/api/supplier/delete/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) { setStatus({ msg: "Xóa đối tác thành công!", type: "success" }); loadSuppliers(); }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
      {/* CỘT TRÁI: FORM NHẬP */}
      <div className="card">
        <h2 className="card__title">{editingId ? "📝 Sửa nhà cung cấp" : "➕ Thêm nhà cung cấp"}</h2>
        {status.msg && <div className={`flash ${status.type}`}>{status.msg}</div>}
        <div className="form-grid">
          <label>Tên:</label>
          <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} />
          <label>SDT:</label>
          <input type="text" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label>Email:</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>Địa chỉ:</label>
          <input type="text" className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          
          <div className="form-actions" style={{ marginTop: "10px" }}>
            {editingId ? (
              <button type="button" className="btn" onClick={HandleEditSupplier}>💾 Sửa</button>
            ) : (
              <button type="button" className="btn" onClick={HandleAddSupplier}>➕ Thêm</button>
            )}
            {editingId && (
              <button type="button" className="btn ghost" onClick={() => { setEditingId(null); setName(""); setPhone(""); setEmail(""); setAddress(""); setStatus({ msg: "", type: "" }); }}>
                Hủy bỏ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: BẢNG DỮ LIỆU ĐỐI TÁC */}
      <div className="card">
        <h2 className="card__title">📋 Danh sách Nhà cung cấp</h2>
        
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", marginTop: "5px" }}>
          <input 
            type="text" 
            className="input" 
            style={{ width: "350px", textAlign: "center", fontSize: "0.95rem" }} 
            placeholder="Tìm kiếm theo tên" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Tên{"              "}</th>
                <th>SDT</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th style={{ textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {displayedSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>
                    Không tìm thấy nhà cung cấp nào phù hợp.
                  </td>
                </tr>
              ) : (
                displayedSuppliers.map((s) => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: "600" }}>{s.name}</td>
                    <td>{s.phone || "---"}</td>
                    <td>{s.email || "---"}</td>
                    <td>{s.address || "---"}</td>
                    <td style={{ textAlign: "center" }}>
                      <div className="row-actions" style={{ justifyContent: "center", gap: "6px" }}>
                        <button className="btn small" onClick={() => { setEditingId(s._id); setName(s.name); setPhone(s.phone || ""); setEmail(s.email || ""); setAddress(s.address || ""); setStatus({ msg: "", type: "" }); }}>Sửa</button>
                        {isAdmin && <button className="btn danger small" onClick={() => HandleDeleteSupplier(s._id)}>Xóa</button>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Supplier;