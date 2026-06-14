require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const dbConnect = require("./db/dbConnect");

const AuthRouter = require("./routes/AuthRouter");
const DashboardRouter = require("./routes/DashboardRouter");
const ProductRouter = require("./routes/ProductRouter");
const InvoiceRouter = require("./routes/InvoiceRouter");
const ReportRouter = require("./routes/ReportRouter");
const CustomerRouter = require("./routes/CustomerRouter");
const SupplierRouter = require("./routes/SupplierRouter");
const WarehouseRouter = require("./routes/WarehouseRouter");

const auth = require("./middleware/auth");

dbConnect();

app.use(cors());
app.use(express.json());

app.use("/api/auth", AuthRouter);
app.use("/api/dashboard", auth, DashboardRouter);
app.use("/api/product", auth, ProductRouter);
app.use("/api/invoice", auth, InvoiceRouter);
app.use("/api/report", auth, ReportRouter);
app.use("/api/customer", auth, CustomerRouter);
app.use("/api/supplier", auth, SupplierRouter);
app.use("/api/warehouse", auth, WarehouseRouter);


app.get("/", (req, res) => {
  res.send({ message: "Hello from warehouse-management app API!" });
});

app
  .listen(8081, () => {
    console.log("server server running in http://localhost:8081/");
  })
  .on("error", (err) => {
    console.error("Server start error:", err);
  });