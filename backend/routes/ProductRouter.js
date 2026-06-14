const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../db/productModel");
const Warehouse = require("../db/warehouseModel");

// 1. GET /api/product/list -> Lấy toàn bộ danh mục sản phẩm
router.get("/list", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST /api/product/create -> Thêm thiết bị mới
router.post("/create", async (req, res) => {
  try {
    const { name, description, cost_price } = req.body; // Lấy thêm cost_price
    const allWarehouses = await Warehouse.find({});
    
    const stockConfig = allWarehouses.map(w => ({
      warehouse_id: w._id,
      quantity: 0,
      low_stock: 5
    }));

    // Lưu cost_price vào DB
    const newProduct = new Product({ 
      name, 
      description, 
      cost_price: Number(cost_price || 0), 
      stock: stockConfig 
    });
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. PUT /api/product/update/:id -> Cập nhật thiết bị
router.put("/update/:id",  async (req, res) => {
  try {
    const { name, description, cost_price } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          name, 
          description, 
          cost_price: Number(cost_price || 0) // Cập nhật luôn giá nhập gốc
        } 
      },
      { returnDocument: 'after' }
    );
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. DELETE /api/product/delete/:id -> Xóa thiết bị
router.delete("/delete/:id", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Chỉ Admin mới có quyền xóa!" });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Xóa thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. GET /api/product/stock -> Xem tồn kho (Khớp tham số warehouse_id)
router.get("/stock", async (req, res) => {
  try {
    let targetWarehouse = req.query.warehouse_id; // Chuẩn snake_case
    if (!targetWarehouse && req.user.role === "staff") {
      targetWarehouse = req.user.warehouse_id;
    }

    let pipeline = [];
    if (targetWarehouse && targetWarehouse !== "ALL") {
      pipeline.push(
        { $unwind: "$stock" },
        { $match: { "stock.warehouse_id": new mongoose.Types.ObjectId(targetWarehouse) } },
        {
          $project: {
            product_id: "$_id",
            product_name: "$name",
            current_stock: "$stock.quantity",
            low_stock: "$stock.low_stock"
          }
        }
      );
    } else {
      pipeline.push(
        { $unwind: "$stock" },
        {
          $group: {
            _id: "$_id",
            product_name: { $first: "$name" },
            current_stock: { $sum: "$stock.quantity" },
            low_stock: { $first: "$stock.low_stock" }
          }
        },
        { $project: { product_id: "$_id", product_name: 1, current_stock: 1, low_stock: 1 } }
      );
    }

    const stockData = await Product.aggregate(pipeline);
    res.status(200).json(stockData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;