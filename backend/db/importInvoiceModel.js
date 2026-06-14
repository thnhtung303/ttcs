const mongoose = require('mongoose');

const importInvoiceSchema = new mongoose.Schema({
    date_time: { type: Date, default: Date.now, required: true },
    warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouses', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Suppliers', required: true }, 
    // Chi tiết mặt hàng thiết bị nhập kho
    items: [{
        _id: false,
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
        quantity: { type: Number, required: true, min: 1 },
        purchase_price: { type: Number, required: true, min: 0 }
    }],
    
    total_amount: { type: Number, required: true, min: 0 }
}, { timestamps: true });

importInvoiceSchema.index({ warehouse_id: 1, date_time: -1 });

module.exports = mongoose.model('ImportInvoices', importInvoiceSchema);