const express = require("express");
const router = express.Router();

const ImportInvoice = require("../db/importInvoiceModel");
const ExportInvoice = require("../db/exportInvoiceModel");
const Product = require("../db/productModel");
const Warehouse = require("../db/warehouseModel");

// Lập phiếu nhập kho
router.post("/import/create", async (req, res) => {
  try {

    const { warehouse_id, supplier_id, items, total_amount } = req.body;

    const newImport = new ImportInvoice({
      warehouse_id,
      user_id: req.user._id, 
      supplier_id, 
      items: items.map(i => ({
        product_id: i.product_id,
        quantity: Number(i.quantity),
        purchase_price: Number(i.purchase_price)
      })),
      total_amount: Number(total_amount)
    });

    await newImport.save();

    // Đồng bộ tăng số lượng hàng tồn kho cho các sản phẩm
    for (const item of items) {
      await Product.updateOne(
        { _id: item.product_id, "stock.warehouse_id": warehouse_id },
        { $inc: { "stock.$.quantity": Number(item.quantity) } }
      );
    }

    res.status(201).json({ success: true, data: newImport });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Lập phiếu xuất kho 
router.post("/export/create", async (req, res) => {
  try {
    const { warehouse_id, customer_id, items, totalAmount } = req.body;

    const newExport = new ExportInvoice({
      warehouse_id,
      user_id: req.user._id, 
      customer_id,
      items: items.map(i => ({
        product_id: i.product_id,
        quantity: Number(i.quantity),
        selling_price: Number(i.selling_price),
        cost_price: Number(i.cost_price)
      })),
      totalAmount: Number(totalAmount) 
    });

    await newExport.save();

    let totalCost = 0;
    for (const item of items) {
      await Product.updateOne(
        { _id: item.product_id, "stock.warehouse_id": warehouse_id },
        { $inc: { "stock.$.quantity": -Number(item.quantity) } }
      );
      totalCost += Number(item.cost_price) * Number(item.quantity);
    }

    const profit = totalAmount - totalCost;

    await Warehouse.findByIdAndUpdate(warehouse_id, {
      $inc: {
        "cachedStats.total_revenue": totalAmount,
        "cachedStats.total_profit": profit
      },
      $set: { "cachedStats.last_calculated": new Date() }
    });

    res.status(201).json({ success: true, data: newExport });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;