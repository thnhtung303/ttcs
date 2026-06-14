const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const ExportInvoice = require("../db/exportInvoiceModel");

//Trích xuất số liệu
router.get("/stats", async (req, res) => {
  try {
    let targetWarehouse = req.query.warehouse_id;
    let filterType = req.query.filter_type || "month"; // Mặc định gom nhóm theo tháng

    if (!targetWarehouse && req.user.role === "staff") {
      targetWarehouse = req.user.warehouse_id;
    }

    // Thiết lập cấu trúc lọc theo Kho hàng
    let matchStage = {};
    if (targetWarehouse && targetWarehouse !== "ALL") {
      matchStage.warehouse_id = new mongoose.Types.ObjectId(targetWarehouse);
    }

    // Xác định định dạng chuỗi ngày tháng dựa trên bộ lọc thời gian
    let dateFormat = "%Y-%m"; // Thống kê theo Tháng
    if (filterType === "day") dateFormat = "%Y-%m-%d"; // Thống kê theo Ngày
    if (filterType === "year") dateFormat = "%Y";       // Thống kê theo Năm

    // BIỂU ĐỒ DOANH THU & LỢI NHUẬN 
    const trendData = await ExportInvoice.aggregate([
      { $match: matchStage },
      {
        $project: {
          date_str: { $dateToString: { format: dateFormat, date: "$date_time" } },
          revenue: "$totalAmount", 
          // Tính tổng giá vốn của hóa đơn = Tổng của (Số lượng * Giá nhập gốc)
          cost: {
            $sum: {
              $map: {
                input: "$items",
                as: "item",
                in: { $multiply: ["$$item.quantity", "$$item.cost_price"] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$date_str",
          total_revenue: { $sum: "$revenue" },
          total_profit: { $sum: { $subtract: ["$revenue", "$cost"] } }
        }
      },
      { $sort: { _id: 1 } } // Sắp xếp tăng dần theo trục thời gian
    ]);

    //  DS hàng bán tốt nhất
    const topProducts = await ExportInvoice.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product_id",
          total_qty: { $sum: "$items.quantity" },
          product_profit: {
            $sum: {
              $multiply: [
                "$items.quantity",
                { $subtract: ["$items.selling_price", "$items.cost_price"] }
              ]
            }
          }
        }
      },
      { $sort: { product_profit: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product_info"
        }
      },
      { $unwind: { path: "$product_info", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          product_name: "$product_info.name",
          total_qty: 1,
          profit: "$product_profit"
        }
      }
    ]);

    // KH mua nhiều nhất
    const topCustomers = await ExportInvoice.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$customer_id",
          total_spent: { $sum: "$totalAmount" }
        }
      },
      { $sort: { total_spent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer_info"
        }
      },
      { $unwind: { path: "$customer_info", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          customer_name: "$customer_info.name",
          total_spent: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      trend: trendData,
      products: topProducts,
      customers: topCustomers
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;