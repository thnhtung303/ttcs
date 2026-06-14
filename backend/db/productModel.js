const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" }, 
    cost_price: { type: Number, default: 0, min: 0 },
    // Mảng lưu trữ số lượng hàng tồn
    stock: [{
        _id: false,
        warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouses', required: true },
        quantity: { type: Number, default: 0, min: 0 },
        low_stock: { type: Number, default: 5 } 
    }]
}, { timestamps: true });

module.exports = mongoose.model.Products || mongoose.model('Products', productSchema);