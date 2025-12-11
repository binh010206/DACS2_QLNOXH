// src/routes/thongbao.route.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/thongbao.controller");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// Admin gửi thông báo riêng
router.post("/", auth, role("admin", "staff"), controller.create);

// Admin gửi thông báo cho TOÀN BỘ cư dân (Quan trọng)
router.post("/broadcast", auth, role("admin", "staff"), controller.broadcast);

// User/Admin xem ds của mình
router.get("/my", auth, controller.listByUser);

// User đánh dấu đã đọc
router.put("/:id/read", auth, controller.markRead);

// User đếm số chưa đọc
router.get("/unread-count", auth, controller.unreadCount);

module.exports = router;