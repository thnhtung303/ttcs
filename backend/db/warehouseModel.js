const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    
    // Lưu trữ số liệu tích lũy phục vụ hiển thị nhanh ở Dashboard chính
    cachedStats: {
        total_revenue: { type: Number, default: 0 },
        total_profit: { type: Number, default: 0 },
        last_calculated: { type: Date, default: Date.now }
    }
}, { timestamps: true });

module.exports = mongoose.model.warehouses || mongoose.model('Warehouses', warehouseSchema);
