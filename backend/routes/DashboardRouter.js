const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const Warehouse = require("../db/warehouseModel");
const Product = require("../db/productModel");

router.get("/summary", async (req, res) => {
  try {
    let targetWarehouse = req.query.warehouse_id; // Đảm bảo dùng warehouse_id
    if (!targetWarehouse && req.user.role === "staff") {
      targetWarehouse = req.user.warehouse_id;
    }

    let total_revenue = 0;
    let total_profit = 0;

    // 1. Tính doanh thu/lợi nhuận từ cachedStats hệ snake_case mới
    if (targetWarehouse && targetWarehouse !== "ALL") {
      const wh = await Warehouse.findById(targetWarehouse);
      if (wh && wh.cachedStats) {
        total_revenue = wh.cachedStats.total_revenue || 0;
        total_profit = wh.cachedStats.total_profit || 0;
      }
    } else {
      const whs = await Warehouse.find({});
      whs.forEach(w => {
        if (w.cachedStats) {
          total_revenue += w.cachedStats.total_revenue || 0;
          total_profit += w.cachedStats.total_profit || 0;
        }
      });
    }

    // 2. Tính số lượng mặt hàng và cảnh báo tồn thấp theo cấu trúc mới
    const products = await Product.find({});
    let low_stock_count = 0;
    let total_products = products.length;

    products.forEach(p => {
      if (targetWarehouse && targetWarehouse !== "ALL") {
        const stockInfo = p.stock.find(s => s.warehouse_id.toString() === targetWarehouse.toString());
        if (stockInfo && stockInfo.quantity <= stockInfo.low_stock) {
          low_stock_count++;
        }
      } else {
        const isLow = p.stock.some(s => s.quantity <= s.low_stock);
        if (isLow) low_stock_count++;
      }
    });

    res.status(200).json({
      success: true,
      data: { total_revenue, total_profit, total_products, low_stock_count }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;