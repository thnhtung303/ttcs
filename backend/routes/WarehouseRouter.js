const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Warehouse = require("../db/warehouseModel");

router.get("/list", async (req, res) => {
  try {
    const data = await Warehouse.find({});
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

