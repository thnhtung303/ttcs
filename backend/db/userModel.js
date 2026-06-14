const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' },

    // id kho
    warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouses', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Users', userSchema);