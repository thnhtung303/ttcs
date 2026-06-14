const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Import đầy đủ các Model theo cấu trúc mới
const User = require("../db/userModel.js"); 
const Warehouse = require("../db/warehouseModel.js"); 
const SchemaInfo = require("../db/schemaInfo.js"); 

const versionString = "1.0";

// Dữ liệu kho khởi tạo trước
const defaultWarehouses = [
  { name: "Kho số 1", address: "Số 12 đường Nguyễn Trãi, Thanh Xuân, Hà Nội" },
  { name: "Kho số 2", address: "Số 97 đường Hoàng Văn Thụ, Minh Khai, Hải Phòng" },
  { name: "Kho số 3", address: "Số 19 đường Hạ Long, Yên Lập, Phú Thọ" }
];

async function dbLoad() {
  try {
    // Kết nối tới MongoDB Atlas / Local
    await mongoose.connect(process.env.DB_URL);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.log("Unable connecting to MongoDB!", error);
    return;
  }

  // Dọn dẹp sạch sẽ dữ liệu cũ trước khi nạp mới
  await Warehouse.deleteMany({});
  await User.deleteMany({});
  await SchemaInfo.deleteMany({});

  // 1. KHỞI TẠO KHO TRƯỚC VÀ LƯU LẠI DANH SÁCH ID THỰC TẾ
  const realWarehouseIds = [];
  
  for (const wh of defaultWarehouses) {
    // ĐÃ SỬA: Khớp thuộc tính cachedStats hệ snake_case mới
    const whObj = new Warehouse({
      name: wh.name,
      address: wh.address,
      cachedStats: {
        total_revenue: 0,
        total_profit: 0,
        last_calculated: new Date()
      }
    });

    try {
      await whObj.save();
      realWarehouseIds.push(whObj._id); // Lưu lại ID tự sinh của Mongo
      console.log("Adding warehouse:", whObj.name, " with ID ", whObj._id);
    } catch (error) {
      console.error("Error create warehouse", error);
    }
  }

  // 2. ĐỊNH NGHĨA DANH SÁCH USER VÀ GÁN ID KHO THỰC TẾ VÀO
  // ĐÃ SỬA: Đổi fullName -> name, assignedWarehouse -> warehouse_id
  const defaultUsers = [
    {
      username: "admin",
      password: "123456",
      name: "admin",
      role: "admin",
      warehouse_id: null // Admin quản lý chung tổng các kho
    },
    {
      username: "nv1",
      password: "123456",
      name: "Nguyễn Văn A",
      role: "staff",
      warehouse_id: realWarehouseIds[0] || null // Gán trực tiếp ID của Kho số 1
    },
    {
      username: "nv2",
      password: "123456",
      name: "Nguyễn Thị B",
      role: "staff",
      warehouse_id: realWarehouseIds[1] || null // Gán trực tiếp ID của Kho số 2
    },
    {
      username: "nv3",
      password: "123456",
      name: "Trần Văn C",
      role: "staff",
      warehouse_id: realWarehouseIds[2] || null // Gán trực tiếp ID của Kho số 3
    }
  ];

  // 3. TIẾN HÀNH LƯU USER VÀO DATABASE
  for (const user of defaultUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    // ĐÃ SỬA: Khớp chính xác trường Schema (password, name, warehouse_id)
    const userObj = new User({
      username: user.username.toLowerCase(),
      password: hashedPassword, 
      name: user.name,
      role: user.role,
      warehouse_id: user.warehouse_id,
    });

    try {
      await userObj.save();
      console.log(
        "Adding user:",
        userObj.name,
        " (Warehouse ID Link: " + (userObj.warehouse_id || "None") + ")",
        " with ID ",
        userObj._id
      );
    } catch (error) {
      console.error("Error create user", error);
    }
  }

  // 4. TẠO SCHEMA INFO QUẢN LÝ VERSION
  try {
    const schemaInfo = await SchemaInfo.create({
      version: versionString,
    });
    console.log("SchemaInfo object created with version ", schemaInfo.version);
  } catch (error) {
    console.error("Error create schemaInfo", error);
  }

  // Ngắt kết nối hoàn thành Script
  mongoose.disconnect();
  console.log("🚀 dbLoad finished successfully!");
}

dbLoad();