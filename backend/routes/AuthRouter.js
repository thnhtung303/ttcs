const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../db/userModel");
require("dotenv").config();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác" });
    }

    const token = jwt.sign(
      { 
        _id: user._id, 
        username: user.username, 
        role: user.role, 
        warehouse_id: user.warehouse_id, 
        name: user.name
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5h" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        warehouse_id: user.warehouse_id
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;