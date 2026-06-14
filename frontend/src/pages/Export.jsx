import React, { useState, useEffect } from "react";
import { exportToExcel } from "../utils/download"; 

const Export = ({ loggedInUser }) => {
  const isAdmin = loggedInUser?.role === "admin";
  const userWarehouse = loggedInUser?.warehouse_id || ""; 

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [selected_warehouse, setSelectedWarehouse] = useState(isAdmin ? "" : userWarehouse);
  const [selected_customer, setSelectedCustomer] = useState("");
  
  const [is_customer_dropdown_open, setIsCustomerDropdownOpen] = useState(false);
  const [customer_search_word, setCustomerSearchWord] = useState("");

  const [items, setItems] = useState([
    { product_id: "", quantity: 1, selling_price: 0, cost_price: 0, is_dropdown_open: false, search_word: "" }
  ]);
  const [status, setStatus] = useState({ msg: "", type: "" });

  const [showModal, setShowModal] = useState(false);
  const [printedData, setPrintedData] = useState(null);

  useEffect(() => {
    const headers = { "Authorization": `Bearer ${localStorage.getItem("token")}` };
    if (isAdmin) {
      fetch("http://localhost:8081/api/warehouse/list", { headers }).then(res => res.json()).then(d => setWarehouses(d));
    }
    fetch("http://localhost:8081/api/product/list", { headers }).then(res => res.json()).then(d => setProducts(d));
    fetch("http://localhost:8081/api/customer/list", { headers }).then(res => res.json()).then(d => setCustomers(d));
  }, [isAdmin]);

  const selectProductAtRow = (index, prodId) => {
    const updated = [...items];
    updated[index].product_id = prodId;
    updated[index].is_dropdown_open = false;
    updated[index].search_word = "";
    
    const targetProduct = products.find(p => p._id === prodId);
    if (targetProduct) {
      updated[index].cost_price = targetProduct.cost_price || 0; 
    }
    setItems(updated);
  };

  const handleValueChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const calculateTotal = () => items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.selling_price || 0)), 0);

  const HandleCreateExportInvoice = async () => {
    if (!selected_warehouse) { setStatus({ msg: "Vui lòng chọn kho xuất!", type: "danger" }); return; }
    if (!selected_customer) { setStatus({ msg: "Vui lòng chọn khách hàng!", type: "danger" }); return; }
    if (items.some(i => !i.product_id)) { setStatus({ msg: "Chưa chọn thiết bị!", type: "danger" }); return; }

    setStatus({ msg: "Đang tiến hành xuất hóa đơn...", type: "info" });
    try {
      const res = await fetch("http://localhost:8081/api/invoice/export/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          warehouse_id: selected_warehouse,
          customer_id: selected_customer,
          items: items.map(i => ({
            product_id: i.product_id,
            quantity: Number(i.quantity),
            selling_price: Number(i.selling_price),
            cost_price: Number(i.cost_price)
          })),
          totalAmount: calculateTotal() 
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ msg: "", type: "" });

        const currentWhName = warehouses.find(w => w._id === selected_warehouse)?.name || "Kho trực thuộc";
        const currentCustName = customers.find(c => c._id === selected_customer)?.name || "Khách mua đối tác";
        
        setPrintedData({
          warehouse_name: currentWhName,
          customer_name: currentCustName,
          items: items.map(i => ({
            name: products.find(p => p._id === i.product_id)?.name || "Thiết bị",
            quantity: Number(i.quantity),
            price: Number(i.selling_price) 
          })),
          total: calculateTotal()
        });

        setShowModal(true);
        setItems([{ product_id: "", quantity: 1, selling_price: 0, cost_price: 0, is_dropdown_open: false, search_word: "" }]);
        setSelectedCustomer("");
      } else {
        setStatus({ msg: data.message || "Thao tác lập phiếu xuất thất bại!", type: "danger" });
      }
    } catch (err) { setStatus({ msg: "Lỗi kết nối máy chủ!", type: "danger" }); }
  };

  const exportExportExcel = () => {
    if (!printedData) return;

    const meta = [
      `Ngày lập: ${new Date().toLocaleString("vi-VN")}`,
      `Kho: ${printedData.warehouse_name}`,
      `Khách hàng: ${printedData.customer_name}`
    ];
    
    const headers = ["STT", "Tên", "Số lượng", "Đơn giá", "Thành tiền (VND)"];
    const dataRows = printedData.items.map((item, index) => [
      index + 1, item.name, item.quantity, item.price, item.quantity * item.price
    ]);

    exportToExcel("HÓA ĐƠN XUẤT KHO", meta, headers, dataRows, "Tổng:", printedData.total, "Hoa_Don_Xuat_Kho");
  };

  // Tìm thông tin khách hàng đang được chọn để hiển thị text lên ô bấm
  const chosenCustomer = customers.find(c => c._id === selected_customer);
  // Lọc danh sách khách hàng dựa theo chữ người dùng gõ
  const filteredCustomers = customers.filter(c => c.name?.toLowerCase().includes(customer_search_word.toLowerCase()));

  return (
    <div className="card" style={{ position: "relative" }}>
      <h2 className="card__title" style={{ color: "var(--bad)" }}>📤 Lập Phiếu Xuất Hàng</h2>
      {status.msg && <div className={`flash ${status.type}`}>{status.msg}</div>}
      
      <div className="form-grid" style={{ marginBottom: "25px" }}>
        <label>Kho xuất:</label>
        {isAdmin ? (
          <select className="input" value={selected_warehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}>
            <option value="">-- Chọn kho xuất --</option>
            {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>
        ) : (
          <input type="text" className="input" value="Kho trực thuộc đang làm việc" disabled style={{ fontWeight: "bold" }} />
        )}

        <label>Khách hàng:</label>
        <div style={{ position: "relative" }}>
          <div className="input" style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setIsCustomerDropdownOpen(!is_customer_dropdown_open)}>
            <span>{chosenCustomer ? chosenCustomer.name : "-- Chọn khách hàng --"}</span>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>▼</span>
          </div>

          {is_customer_dropdown_open && (
            <div className="card" style={{ position: "absolute", top: "105%", left: 0, right: 0, zIndex: 1000, padding: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
              <input 
                type="text" 
                className="input" 
                placeholder="Tìm khách hàng theo tên" 
                value={customer_search_word} 
                onChange={(e) => setCustomerSearchWord(e.target.value)} 
                style={{ marginBottom: "8px" }}
                autoFocus
              />
              <div style={{ maxHeight: "160px", overflowY: "auto" }}>
                {filteredCustomers.length === 0 ? (
                  <div style={{ padding: "8px", color: "var(--muted)", textAlign: "center" }}>Không tìm thấy khách hàng nào</div>
                ) : (
                  filteredCustomers.map(c => (
                    <div 
                      key={c._id} 
                      className="nav__item" 
                      style={{ padding: "8px", cursor: "pointer", borderRadius: "4px" }} 
                      onClick={() => {
                        setSelectedCustomer(c._id);
                        setIsCustomerDropdownOpen(false);
                        setCustomerSearchWord("");
                      }}
                    >
                      {c.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "6px", fontWeight: "600", color: "var(--muted)" }}>
        <div style={{ flex: 2 }}>Tên sản phẩm</div>
        <div style={{ flex: 0.6 }}>Số lượng</div>
        <div style={{ flex: 1.2 }}>Đơn giá(VND)</div>
        <div style={{ flex: 1.2 }}>Giá gốc(VND)</div>
        <div style={{ width: "60px" }}></div>
      </div>

      {items.map((item, index) => {
        const chosenProduct = products.find(p => p._id === item.product_id);
        const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(item.search_word.toLowerCase()));

        return (
          <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <div style={{ flex: 2, position: "relative" }}>
              <div className="input" style={{ cursor: "pointer" }} onClick={() => { const u = [...items]; u[index].is_dropdown_open = !u[index].is_dropdown_open; setItems(u); }}>
                {chosenProduct ? chosenProduct.name : "-- Chọn sản phẩm --"}
              </div>
              {item.is_dropdown_open && (
                <div className="card" style={{ position: "absolute", top: "105%", left: 0, right: 0, zIndex: 999, padding: "10px" }}>
                  <input type="text" className="input" placeholder="Sản phẩm theo tên" value={item.search_word} onChange={(e) => { const u = [...items]; u[index].search_word = e.target.value; setItems(u); }} style={{ marginBottom: "8px" }} />
                  <div style={{ maxHeight: "160px", overflowY: "auto" }}>
                    {filteredProducts.map(p => <div key={p._id} className="nav__item" style={{ padding: "8px", cursor: "pointer" }} onClick={() => selectProductAtRow(index, p._id)}>{p.name}</div>)}
                  </div>
                </div>
              )}
            </div>
            <input className="input" style={{ flex: 0.6 }} type="number" min="1" value={item.quantity} onChange={(e) => handleValueChange(index, "quantity", e.target.value)} />
            <input className="input" style={{ flex: 1.2 }} type="number" min="0" value={item.selling_price} onChange={(e) => handleValueChange(index, "selling_price", e.target.value)} />
            <input className="input" style={{ flex: 1.2, backgroundColor: "rgba(0, 0, 0, 0.06)", cursor: "not-allowed", fontWeight: "600" }} type="number" value={item.cost_price} readOnly />
            <button type="button" className="btn danger small" style={{ height: "38px" }} onClick={() => setItems(items.filter((_, i) => i !== index))}>Xóa</button>
          </div>
        );
      })}
      <button type="button" className="btn ghost small" onClick={() => setItems([...items, { product_id: "", quantity: 1, selling_price: 0, cost_price: 0, is_dropdown_open: false, search_word: "" }])}>+ Thêm dòng</button>
      
      <div style={{ marginTop: "25px", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "15px" }}>
        <h2>Doanh thu đơn xuất: <span style={{ color: "var(--brand)" }}>{calculateTotal().toLocaleString()} VND</span></h2>
        <button type="button" className="btn" style={{ backgroundColor: "var(--bad)" }} onClick={HandleCreateExportInvoice}>Xác nhận xuất</button>
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div className="card" style={{ width: "360px", padding: "30px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.14)", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 16px auto" }}>
              <span style={{ fontSize: "3rem", color: "var(--ok)" }}>✓</span>
            </div>
            <h2 style={{ marginBottom: "10px" }}>Xuất Hàng Thành Công!</h2>
            <p style={{ color: "var(--muted)", marginBottom: "24px", fontSize: "0.95rem" }}>Hóa đơn bán hàng đã lưu.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button type="button" className="btn" style={{ backgroundColor: "var(--bad)" }} onClick={exportExportExcel}>🖨️ In hóa đơn</button>
              <button type="button" className="btn ghost" onClick={() => setShowModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Export;