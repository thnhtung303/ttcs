import React, { useState, useEffect } from "react";
import { exportToExcel } from "../utils/download"; 

const Import = ({ loggedInUser }) => {
  const isAdmin = loggedInUser?.role === "admin";
  const userWarehouse = loggedInUser?.warehouse_id || ""; 

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  const [selected_warehouse, setSelectedWarehouse] = useState(isAdmin ? "" : userWarehouse);
  const [selected_supplier, setSelectedSupplier] = useState("");
  
  const [is_supplier_dropdown_open, setIsSupplierDropdownOpen] = useState(false);
  const [supplier_search_word, setSupplierSearchWord] = useState("");

  const [items, setItems] = useState([
    { product_id: "", quantity: 1, purchase_price: 0, is_dropdown_open: false, search_word: "" }
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
    fetch("http://localhost:8081/api/supplier/list", { headers }).then(res => res.json()).then(d => setSuppliers(d));
  }, [isAdmin]);

  const selectProductAtRow = (index, prodId) => {
    const updated = [...items];
    updated[index].product_id = prodId;
    updated[index].is_dropdown_open = false;
    updated[index].search_word = "";
    
    const targetProduct = products.find(p => p._id === prodId);
    if (targetProduct) {
      updated[index].purchase_price = targetProduct.cost_price || 0;
    }
    setItems(updated);
  };

  const handleValueChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const calculateTotal = () => items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.purchase_price || 0)), 0);

  const HandleCreateImportInvoice = async () => {
    if (!selected_warehouse) { setStatus({ msg: "Vui lòng chọn kho nhận hàng!", type: "danger" }); return; }
    if (!selected_supplier) { setStatus({ msg: "Vui lòng chọn nhà cung cấp thiết bị!", type: "danger" }); return; }
    if (items.some(i => !i.product_id)) { setStatus({ msg: "Có dòng chưa chọn thiết bị!", type: "danger" }); return; }

    setStatus({ msg: "Đang tiến hành lập phiếu nhập...", type: "info" });
    try {
      const res = await fetch("http://localhost:8081/api/invoice/import/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          warehouse_id: selected_warehouse, 
          supplier_id: selected_supplier, 
          items: items.map(i => ({
            product_id: i.product_id,
            quantity: Number(i.quantity),
            purchase_price: Number(i.purchase_price)
          })),
          total_amount: calculateTotal() 
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ msg: "", type: "" });
        
        const currentWhName = warehouses.find(w => w._id === selected_warehouse)?.name || "Kho trực thuộc";
        const currentSplName = suppliers.find(s => s._id === selected_supplier)?.name || "Nhà cung cấp hàng";

        setPrintedData({
          warehouse_name: currentWhName,
          supplier_name: currentSplName, 
          items: items.map(i => ({
            name: products.find(p => p._id === i.product_id)?.name || "Thiết bị",
            quantity: Number(i.quantity),
            price: Number(i.purchase_price)
          })),
          total: calculateTotal()
        });

        setShowModal(true);
        setItems([{ product_id: "", quantity: 1, purchase_price: 0, is_dropdown_open: false, search_word: "" }]);
        setSelectedSupplier("");
      } else {
        setStatus({ msg: data.message || "Thao tác lập phiếu thất bại!", type: "danger" });
      }
    } catch (err) { setStatus({ msg: "Lỗi hệ thống kết nối!", type: "danger" }); }
  };

  const exportImportExcel = () => {
    if (!printedData) return;

    const meta = [
      `Ngày lập: ${new Date().toLocaleString("vi-VN")}`,
      `Kho: ${printedData.warehouse_name}`,
      `Nhà cung cấp: ${printedData.supplier_name}` 
    ];
    
    const headers = ["STT", "Tên", "Số lượng", "Đơn giá", "Thành tiền (VND)"];
    const dataRows = printedData.items.map((item, index) => [
      index + 1, item.name, item.quantity, item.price, item.quantity * item.price
    ]);

    exportToExcel("PHIẾU NHẬP KHO", meta, headers, dataRows, "Tổng:", printedData.total, "Phieu_Nhap_Kho");
  };

  // Tìm thông tin nhà cung cấp đang được chọn để hiển thị text lên ô bấm
  const chosenSupplier = suppliers.find(s => s._id === selected_supplier);
  // Lọc danh sách nhà cung cấp dựa theo chữ người dùng gõ
  const filteredSuppliers = suppliers.filter(s => s.name?.toLowerCase().includes(supplier_search_word.toLowerCase()));

  return (
    <div className="card" style={{ position: "relative" }}>
      <h2 className="card__title">📥 Lập Phiếu Nhập Hàng</h2>
      {status.msg && <div className={`flash ${status.type}`}>{status.msg}</div>}
      
      <div className="form-grid" style={{ marginBottom: "25px" }}>
        <label>Kho nhận:</label>
        {isAdmin ? (
          <select className="input" value={selected_warehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}>
            <option value="">-- Chọn kho nhập --</option>
            {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>
        ) : (
          <input type="text" className="input" value="Kho trực thuộc đang làm việc" disabled style={{ fontWeight: "bold" }} />
        )}


        <label>Nhà cung cấp:</label>
        <div style={{ position: "relative" }}>
          <div className="input" style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setIsSupplierDropdownOpen(!is_supplier_dropdown_open)}>
            <span>{chosenSupplier ? chosenSupplier.name : "-- Chọn Nhà cung cấp --"}</span>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>▼</span>
          </div>
          
          {is_supplier_dropdown_open && (
            <div className="card" style={{ position: "absolute", top: "105%", left: 0, right: 0, zIndex: 1000, padding: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
              <input 
                type="text" 
                className="input" 
                placeholder="Tìm kiếm theo tên..." 
                value={supplier_search_word} 
                onChange={(e) => setSupplierSearchWord(e.target.value)} 
                style={{ marginBottom: "8px" }}
                autoFocus
              />
              <div style={{ maxHeight: "160px", overflowY: "auto" }}>
                {filteredSuppliers.length === 0 ? (
                  <div style={{ padding: "8px", color: "var(--muted)", textAlign: "center" }}>Không tìm thấy nhà cung cấp nào</div>
                ) : (
                  filteredSuppliers.map(s => (
                    <div 
                      key={s._id} 
                      className="nav__item" 
                      style={{ padding: "8px", cursor: "pointer", borderRadius: "4px" }} 
                      onClick={() => {
                        setSelectedSupplier(s._id);
                        setIsSupplierDropdownOpen(false);
                        setSupplierSearchWord("");
                      }}
                    >
                      {s.name}
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
        <div style={{ flex: 0.8 }}>Số lượng</div>
        <div style={{ flex: 1.2 }}>Đơn giá (VND)</div>
        <div style={{ width: "60px" }}></div>
      </div>

      {items.map((item, index) => {
        const chosenProduct = products.find(p => p._id === item.product_id);
        const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(item.search_word.toLowerCase()));

        return (
          <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <div style={{ flex: 2, position: "relative" }}>
              <div className="input" style={{ cursor: "pointer" }} onClick={() => { const u = [...items]; u[index].is_dropdown_open = !u[index].is_dropdown_open; setItems(u); }}>
                {chosenProduct ? chosenProduct.name : "-- Ấn để chọn thiết bị --"}
              </div>
              {item.is_dropdown_open && (
                <div className="card" style={{ position: "absolute", top: "105%", left: 0, right: 0, zIndex: 999, padding: "10px" }}>
                  <input type="text" className="input" placeholder="Kiếm theo tên..." value={item.search_word} onChange={(e) => { const u = [...items]; u[index].search_word = e.target.value; setItems(u); }} style={{ marginBottom: "8px" }} />
                  <div style={{ maxHeight: "160px", overflowY: "auto" }}>
                    {filteredProducts.map(p => <div key={p._id} className="nav__item" style={{ padding: "8px", cursor: "pointer" }} onClick={() => selectProductAtRow(index, p._id)}>{p.name}</div>)}
                  </div>
                </div>
              )}
            </div>
            <input className="input" style={{ flex: 0.8 }} type="number" min="1" value={item.quantity} onChange={(e) => handleValueChange(index, "quantity", e.target.value)} />
            <input className="input" style={{ flex: 1.2, backgroundColor: "rgba(0, 0, 0, 0.06)", cursor: "not-allowed", fontWeight: "600" }} type="number" value={item.purchase_price} readOnly />
            <button type="button" className="btn danger small" style={{ height: "38px" }} onClick={() => setItems(items.filter((_, i) => i !== index))}>Xóa</button>
          </div>
        );
      })}
      <button type="button" className="btn ghost small" onClick={() => setItems([...items, { product_id: "", quantity: 1, purchase_price: 0, is_dropdown_open: false, search_word: "" }])}>+ Thêm dòng</button>
      
      <div style={{ marginTop: "25px", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "15px" }}>
        <h2>Tổng tiền: <span style={{ color: "var(--ok)" }}>{calculateTotal().toLocaleString()} VND</span></h2>
        <button type="button" className="btn" onClick={HandleCreateImportInvoice}>Xác nhận nhập phiếu</button>
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div className="card" style={{ width: "360px", padding: "30px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.14)", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 16px auto" }}>
              <span style={{ fontSize: "3rem", color: "var(--ok)" }}>✓</span>
            </div>
            <h2 style={{ marginBottom: "10px" }}>Nhập Hàng Thành Công!</h2>
            <p style={{ color: "var(--muted)", marginBottom: "24px", fontSize: "0.95rem" }}>Hoá đơn nhập hàng đã được lưu.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button type="button" className="btn" onClick={exportImportExcel}>🖨️ In phiếu nhập</button>
              <button type="button" className="btn ghost" onClick={() => setShowModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Import;