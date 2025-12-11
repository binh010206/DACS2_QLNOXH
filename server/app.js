const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

dotenv.config();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 15 phút." }
});
// app.use(limiter);

// 1. Cấu hình thư mục Uploads
const uploadsDir = path.join(__dirname, "uploads");
const hopDongDir = path.join(uploadsDir, "hop_dong");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(hopDongDir)) fs.mkdirSync(hopDongDir, { recursive: true });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 2. ROUTES
const canHoRoute = require("./src/routes/can_ho.route");
const authRoute = require("./src/routes/auth.route");
const userRoute = require("./src/routes/user.route");
const hoSoRoute = require("./src/routes/ho_so.route");
const hopDongRoute = require("./src/routes/hop_dong.route");
const adminRoute = require("./src/routes/admin.route");
const thongBaoRoute = require("./src/routes/thongbao.route");
const phanAnhRoute = require("./src/routes/phan_anh.route");
const lienHeRoute = require("./src/routes/lien_he.route");

app.use("/api/lien-he", limiter, require("./src/routes/lien_he.route")); 
app.use("/api/auth", limiter, require("./src/routes/auth.route"));

app.use("/api/can-ho", canHoRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/ho-so", hoSoRoute);
app.use("/api/hop-dong", hopDongRoute);
app.use("/api/admin", adminRoute);
app.use("/api/thong-bao", thongBaoRoute);
app.use("/api/phan-anh", phanAnhRoute);
app.use("/api/lien-he", lienHeRoute);



app.get("/", (req, res) => res.send("API Quản lý Nhà ở Xã hội đang chạy 🚀"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server đang chạy tại http://localhost:${PORT}`));