const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Customers', customerSchema);