const express = require("express");
const router = express.Router();
const Customer = require("../db/customerModel");

// 1. GET /api/customer/list -> Lấy danh sách khách hàng
router.get("/list", async (req, res) => {
  try {
    const data = await Customer.find({}).sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST /api/customer/create -> Thêm đối tác khách hàng mới
router.post("/create", async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Tên khách hàng không được để trống" });

    const newCustomer = new Customer({ name, phone, email, address });
    await newCustomer.save();
    res.status(201).json({ success: true, data: newCustomer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. PUT /api/customer/update/:id -> Cập nhật thông tin khách hàng
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Không tìm thấy khách hàng!" });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. DELETE /api/customer/delete/:id -> Xóa khách hàng (Chỉ Admin)
router.delete("/delete/:id", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Chỉ tài khoản Admin mới có quyền xóa đối tác!" });
    }
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Không tìm thấy khách hàng cần xóa" });
    res.status(200).json({ success: true, message: "Xóa đối tác khách hàng thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;