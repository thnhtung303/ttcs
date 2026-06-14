const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  // Lấy token từ header Authorization: Bearer <token>
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "No Token." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = verified; // Lưu thông tin payload của user vào request
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: "Invalid Token." });
  }
};