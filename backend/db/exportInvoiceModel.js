const mongoose = require('mongoose');

const exportInvoiceSchema = new mongoose.Schema({
    date_time: { type: Date, default: Date.now, required: true },
    warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouses', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customers', required: true },

    // Chi tiết danh sách thiết bị xuất bán
    items: [{
        _id: false,
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
        quantity: { type: Number, required: true, min: 1 },
        selling_price: { type: Number, required: true, min: 0 },
        // Chụp lại giá nhập tại thời điểm xuất để tính toán lợi nhuận kho tức thì
        cost_price: { type: Number, required: true, min: 0 }
    }],
    
    totalAmount: { type: Number, required: true, min: 0 }
}, { timestamps: true });

// Index phục vụ tối ưu hóa tốc độ Aggregation cho thống kê theo Kho và mốc thời gian
exportInvoiceSchema.index({ warehouseId: 1, exportDate: -1 });

module.exports = mongoose.model('ExportInvoices', exportInvoiceSchema);