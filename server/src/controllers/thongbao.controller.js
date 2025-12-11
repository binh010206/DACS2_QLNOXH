// src/controllers/thongbao.controller.js
const db = require("../config/db");
const statuses = require("../constants/status");
const ThongBao = require("../models/ThongBao");

// Admin gửi thông báo riêng cho 1 người
exports.create = (req, res) => {
  const { user_id, tieu_de, noi_dung } = req.body;
  if (!user_id || !noi_dung) return res.status(400).json({ message: "Thiếu dữ liệu" });

  ThongBao.create({ user_id, tieu_de, noi_dung, loai: 'admin' }, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi DB", err });
    return res.status(201).json({ success: true, message: "Đã gửi thông báo" });
  });
};

// Admin gửi thông báo cho TẤT CẢ cư dân (Broadcast)
exports.broadcast = (req, res) => {
    const { tieu_de, noi_dung } = req.body;
    if (!tieu_de || !noi_dung) return res.status(400).json({ message: "Thiếu tiêu đề hoặc nội dung" });

    ThongBao.broadcast(tieu_de, noi_dung, (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi server", err });
        return res.json({ success: true, message: `Đã gửi thông báo tới cư dân` });
    });
};

// User xem danh sách

exports.listByUser = (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Gọi hàm getByUser vừa sửa
  ThongBao.getByUser(userId, page, limit, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi DB", err });
    return res.json({ success: true, ...result });
  });
};
  
// User đánh dấu đã đọc
exports.markRead = (req, res) => {
  const id = req.params.id;
  ThongBao.markRead(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi DB", err });
    return res.json({ success: true, message: "Đã đọc" });
  });
};

// Đếm số chưa đọc
exports.unreadCount = (req, res) => {
  const userId = req.user.id;
  ThongBao.countUnread(userId, (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi DB", err });
    return res.json({ success: true, count: rows[0].total });
  });
};