// src/routes/phan_anh.route.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/phan_anh.controller");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// User gửi phản ánh
router.post("/", auth, controller.create);

// User xem lịch sử
router.get("/my", auth, controller.getMyRequests);

// Admin xem tất cả
router.get("/", auth, role("admin", "staff"), controller.listAll);

// Admin xử lý (đổi trạng thái)
router.put("/:id", auth, role("admin", "staff"), controller.updateStatus);

// Admin xóa
router.delete("/:id", auth, role("admin"), controller.delete);

module.exports = router;