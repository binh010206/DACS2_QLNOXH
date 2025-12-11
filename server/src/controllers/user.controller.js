// src/controllers/user.controller.js
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const db = require("../config/db");
const User = require("../models/User");

exports.list = (req, res) => {
  User.getAll((err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    res.json(rows);
  });
};

exports.get = (req, res) => {
  const id = req.params.id;
  User.findById(id, (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    if (!rows || rows.length === 0) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(rows[0]);
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const data = { ...req.body };

  // nếu update password -> hash
  if (data.password) data.password = bcrypt.hashSync(data.password, 10);

  User.update(id, data, (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy" });
    res.json({ message: "Cập nhật thành công" });
  });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  User.remove(id, (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy" });
    res.json({ message: "Xóa thành công" });
  });
};


exports.getMyInfo = (req, res) => {
    const userId = req.user.id;
    // Chọn thêm trường avatar, phone
    db.query("SELECT id, name, email, phone, avatar, role FROM users WHERE id = ?", [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: "Lỗi DB", err });
        return res.json({ success: true, data: rows[0] });
    });
};


exports.updateMyInfo = (req, res) => {
    const userId = req.user.id;
    const { name, phone, avatar } = req.body; 

    if (!name) return res.status(400).json({ message: "Tên không được để trống" });

    const sql = "UPDATE users SET name = ?, phone = ?, avatar = ? WHERE id = ?";
    db.query(sql, [name, phone, avatar, userId], (err) => {
        if (err) return res.status(500).json({ message: "Lỗi DB", err });
        return res.json({ success: true, message: "Cập nhật hồ sơ thành công!" });
    });
};


exports.changePassword = (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
        return res.status(400).json({ message: "Thiếu dữ liệu" });

    db.query("SELECT password FROM users WHERE id = ?", [userId], async (err, rows) => {
        if (err || rows.length === 0) return res.status(500).json({ message: "Lỗi DB" });

        const hashedPassword = rows[0].password;
        const isMatch = await bcrypt.compare(oldPassword, hashedPassword);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

        const newHash = await bcrypt.hash(newPassword, 10);
        db.query("UPDATE users SET password = ? WHERE id = ?", [newHash, userId], (err2) => {
            if (err2) return res.status(500).json({ message: "Lỗi DB" });
            return res.json({ success: true, message: "Đổi mật khẩu thành công" });
        });
    });
};

exports.getAllUsers = (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  let offset = (page - 1) * limit;

  db.query("SELECT COUNT(*) AS total FROM users", (errCount, countRows) => {
    if (errCount) return res.status(500).json({ message: "Lỗi DB", errCount });

    const total = countRows[0].total;

    db.query(
      "SELECT id, name, email, role FROM users LIMIT ? OFFSET ?",
      [limit, offset],
      (err, rows) => {
        if (err) return res.status(500).json({ message: "Lỗi DB", err });

        return res.json({
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          data: rows
        });
      }
    );
  });
};

