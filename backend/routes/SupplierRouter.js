const express = require("express");
const router = express.Router();
const Supplier = require("../db/supplierModel");

// 1. GET /api/supplier/list -> Lấy danh sách nhà cung cấp
router.get("/list", async (req, res) => {
  try {
    const data = await Supplier.find({}).sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST /api/supplier/create -> Thêm nhà cung cấp mới
router.post("/create", async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Tên nhà cung cấp không được để trống" });

    const newSupplier = new Supplier({ name, phone, email, address });
    await newSupplier.save();
    res.status(201).json({ success: true, data: newSupplier });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. PUT /api/supplier/update/:id -> Cập nhật thông tin nhà cung cấp
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Không tìm thấy nhà cung cấp!" });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. DELETE /api/supplier/delete/:id -> Xóa nhà cung cấp (Chỉ Admin)
router.delete("/delete/:id", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Chỉ Admin mới được xóa nhà cung cấp!" });
    }
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Không tìm thấy nhà cung cấp cần xóa" });
    res.status(200).json({ success: true, message: "Xóa nhà cung cấp thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;