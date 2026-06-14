import React, { useState, useEffect } from "react";

const Customer = ({ loggedInUser }) => {
  const isAdmin = loggedInUser?.role === "admin";

  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State chạy Live Search tự động

  // Form States
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState({ msg: "", type: "" });

  const loadCustomers = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/customer/list", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) setCustomers(await res.json());
    } catch (err) {
      console.error("Lỗi tải danh sách khách hàng:", err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const displayedCustomers = customers.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return c.name?.toLowerCase().includes(query);
  });

  const HandleAddCustomer = async () => {
    if (!name.trim()) { setStatus({ msg: "Vui lòng nhập tên khách hàng!", type: "danger" }); return; }
    setStatus({ msg: "Đang xử lý...", type: "info" });
    try {
      const res = await fetch("http://localhost:8081/api/customer/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ name, phone, address })
      });
      if (res.ok) {
        setStatus({ msg: "Thêm thông tin khách hàng thành công!", type: "success" });
        setName(""); setPhone(""); setAddress(""); loadCustomers();
      }
    } catch (err) { setStatus({ msg: "Lỗi máy chủ!", type: "danger" }); }
  };

  const HandleEditCustomer = async () => {
    if (!name.trim()) { setStatus({ msg: "Tên không được để trống!", type: "danger" }); return; }
    setStatus({ msg: "Đang cập nhật...", type: "info" });
    try {
      const res = await fetch(`http://localhost:8081/api/customer/update/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ name, phone, address })
      });
      if (res.ok) {
        setStatus({ msg: "Cập nhật thông tin thành công!", type: "success" });
        setEditingId(null); setName(""); setPhone(""); setAddress(""); loadCustomers();
      }
    } catch (err) { setStatus({ msg: "Lỗi máy chủ!", type: "danger" }); }
  };

  const HandleDeleteCustomer = async (id) => {
    if (!window.confirm("Xóa khách hàng đối tác này khỏi danh sách?")) return;
    try {
      const res = await fetch(`http://localhost:8081/api/customer/delete/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) { setStatus({ msg: "Xóa đối tác thành công!", type: "success" }); loadCustomers(); }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
      {/* CỘT TRÁI: FORM NHẬP */}
      <div className="card">
        <h2 className="card__title">{editingId ? "Sửa khách hàng" : "➕ Thêm khách hàng"}</h2>
        {status.msg && <div className={`flash ${status.type}`}>{status.msg}</div>}
        <div className="form-grid">
          <label>Tên:</label>
          <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} />
          <label>SDT:</label>
          <input type="text" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label>Địa chỉ:</label>
          <input type="text" className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          
          <div className="form-actions" style={{ marginTop: "10px" }}>
            {editingId ? (
              <button type="button" className="btn" onClick={HandleEditCustomer}>💾 Sửa</button>
            ) : (
              <button type="button" className="btn" onClick={HandleAddCustomer}>➕ Thêm</button>
            )}
            {editingId && (
              <button type="button" className="btn ghost" onClick={() => { setEditingId(null); setName(""); setPhone(""); setAddress(""); setStatus({ msg: "", type: "" }); }}>
                Hủy bỏ
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card__title">Danh sách Khách hàng</h2>
        
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
                <th>Họ tên{"              "}</th>
                <th>SDT</th>
                <th>Địa chỉ</th>
                <th style={{ textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {displayedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>
                    Không tìm thấy khách hàng nào phù hợp.
                  </td>
                </tr>
              ) : (
                displayedCustomers.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: "600" }}>{c.name}</td>
                    <td>{c.phone || "---"}</td>
                    <td>{c.address || "---"}</td>
                    <td style={{ textAlign: "center" }}>
                      <div className="row-actions" style={{ justifyContent: "center", gap: "6px" }}>
                        <button className="btn small" onClick={() => { setEditingId(c._id); setName(c.name); setPhone(c.phone || ""); setAddress(c.address || ""); setStatus({ msg: "", type: "" }); }}>Sửa</button>
                        {isAdmin && <button className="btn danger small" onClick={() => HandleDeleteCustomer(c._id)}>Xóa</button>}
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

export default Customer;